const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..');

// Helper to safely read and write JSON files
function readJSON(filename, defaultVal = []) {
  try {
    const fullPath = path.join(DATA_DIR, filename);
    if (fs.existsSync(fullPath)) {
      const data = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
  }
  return defaultVal;
}

function writeJSON(filename, data) {
  try {
    const fullPath = path.join(DATA_DIR, filename);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
  }
}

// Generate unique ID
function generateId(prefix = '') {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// Helper to match documents against simple MongoDB-like query objects
function matchesQuery(item, query = {}) {
  for (const key of Object.keys(query)) {
    if (key === '$or' && Array.isArray(query.$or)) {
      const orMatched = query.$or.some(subQuery => matchesQuery(item, subQuery));
      if (!orMatched) return false;
      continue;
    }

    const val = item[key];
    const target = query[key];

    if (target === undefined) continue;

    if (target !== null && typeof target === 'object' && !Array.isArray(target)) {
      // Handle operators like $in, $regex, $gt, etc.
      if ('$in' in target && Array.isArray(target.$in)) {
        const itemVal = Array.isArray(val) ? val : [val];
        const hasMatch = itemVal.some(v =>
          target.$in.some(t => {
            if (t instanceof RegExp) return t.test(String(v || ''));
            return String(v) === String(t);
          })
        );
        if (!hasMatch) return false;
        continue;
      }
      if ('$regex' in target) {
        const flags = target.$options || '';
        const regex = new RegExp(target.$regex, flags);
        if (!regex.test(String(val || ''))) return false;
        continue;
      }
      if ('$gt' in target && !(val > target.$gt)) return false;
      if ('$gte' in target && !(val >= target.$gte)) return false;
      if ('$lt' in target && !(val < target.$lt)) return false;
      if ('$lte' in target && !(val <= target.$lte)) return false;
      if ('$ne' in target && (String(val) === String(target.$ne))) return false;
      continue;
    }

    // Direct comparison
    if (key === 'email') {
      if (String(val || '').trim().toLowerCase() !== String(target || '').trim().toLowerCase()) {
        return false;
      }
    } else {
      if (String(val) !== String(target)) {
        return false;
      }
    }
  }
  return true;
}

// Query chain wrapper to support Mongoose-like syntax: .populate().sort().skip().limit()
class QueryChain {
  constructor(items, localDB) {
    this.items = [...items];
    this.localDB = localDB;
  }

  populate(field, select) {
    this.items = this.items.map(item => {
      const copy = { ...item };
      if (field === 'teacherId') {
        const teacher = this.localDB.getUserById(copy.teacherId);
        if (teacher) {
          copy.teacherId = {
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            bio: teacher.bio || '',
            profileImage: teacher.profileImage || teacher.avatar || ''
          };
        }
      } else if (field === 'studentId') {
        const sid = copy.studentId?._id || copy.studentId;
        const student = this.localDB.getUserById(sid);
        if (student) {
          copy.studentId = {
            _id: student._id,
            name: student.name,
            email: student.email,
            profileImage: student.profileImage || student.avatar || ''
          };
        }
      } else if (field === 'courseId') {
        const course = this.localDB.getCourseById(copy.courseId);
        if (course) {
          copy.courseId = {
            _id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            category: course.category,
            difficulty: course.difficulty,
            duration: course.duration
          };
        }
      } else if (field === 'assignmentId') {
        const assignment = this.localDB.getAssignmentById(copy.assignmentId);
        if (assignment) {
          const course = this.localDB.getCourseById(assignment.courseId);
          copy.assignmentId = {
            _id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            maxMarks: assignment.maxMarks,
            courseId: course ? { _id: course._id, title: course.title } : assignment.courseId
          };
        }
      } else if (field.startsWith('enrolledStudents')) {
        if (Array.isArray(copy.enrolledStudents)) {
          copy.enrolledStudents = copy.enrolledStudents.map(enr => {
            const student = this.localDB.getUserById(enr.studentId);
            return {
              ...enr,
              studentId: student ? {
                _id: student._id,
                name: student.name,
                email: student.email,
                profileImage: student.profileImage || student.avatar || ''
              } : enr.studentId
            };
          });
        }
      }
      return copy;
    });
    return this;
  }

  sort(sortObj = {}) {
    const keys = Object.keys(sortObj);
    if (keys.length === 0) return this;
    const key = keys[0];
    const order = sortObj[key] === -1 || sortObj[key] === 'desc' ? -1 : 1;

    this.items.sort((a, b) => {
      let va = a[key];
      let vb = b[key];
      if (va instanceof Date) va = va.getTime();
      if (vb instanceof Date) vb = vb.getTime();
      if (typeof va === 'string' && (va.includes('T') || !isNaN(Date.parse(va)))) {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      }
      if (va < vb) return -1 * order;
      if (va > vb) return 1 * order;
      return 0;
    });
    return this;
  }

  skip(count) {
    const n = Math.max(0, parseInt(count) || 0);
    this.items = this.items.slice(n);
    return this;
  }

  limit(count) {
    const n = parseInt(count);
    if (!isNaN(n) && n > 0) {
      this.items = this.items.slice(0, n);
    }
    return this;
  }

  select(fieldsStr) {
    // simplified select handling
    return this;
  }

  // Thenable to resolve as promise
  then(resolve, reject) {
    const result = this.items.map(item => this.localDB.wrapModel(item));
    return Promise.resolve(result).then(resolve, reject);
  }
}

class LocalDB {
  constructor() {
    this.initData();
  }

  initData() {
    this.users = readJSON('data_users.json', []);
    this.courses = readJSON('data_courses.json', []);
    this.enrollments = readJSON('data_enrollments.json', []);
    this.assignments = readJSON('data_assignments.json', []);
    this.submissions = readJSON('data_submissions.json', []);
    this.grades = readJSON('data_grades.json', []);
    this.materials = readJSON('data_materials.json', []);
    this.discussions = readJSON('data_discussions.json', []);
    this.notifications = readJSON('data_notifications.json', []);

    // Ensure seed data if empty
    this.seedDefaultsIfNeeded();
  }

  seedDefaultsIfNeeded() {
    let dirty = false;

    // 1. Seed Teacher & Student if missing
    const teacherEmail = 'teacher@aimhigher.com';
    let teacher = this.users.find(u => u.email.toLowerCase() === teacherEmail);
    if (!teacher) {
      teacher = {
        _id: 'teacher_1',
        name: 'Prof. Sarah Jenkins',
        email: teacherEmail,
        // password: Teacher@123
        password: '$2a$10$ips3tOQYU5eSYlsodrym1eWCJbK3sGj9wxlaMr2OsfL3qx3lAyLHK',
        role: 'teacher',
        bio: 'Senior Professor of Software Engineering with 12+ years of industry experience at leading tech companies.',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: new Date('2026-01-15T09:00:00Z'),
        enrolledCourses: [],
        createdCourses: []
      };
      this.users.push(teacher);
      dirty = true;
    }

    const studentEmail = 'student@aimhigher.com';
    let student = this.users.find(u => u.email.toLowerCase() === studentEmail);
    if (!student) {
      student = {
        _id: 'student_1',
        name: 'Alex Johnson',
        email: studentEmail,
        // password: Student@123
        password: '$2a$10$/AEtqBBfd7c2ETrrJpcJYuVcmXkd4jbZWgqSvVJQBHYUYZewP6nR2',
        role: 'student',
        bio: 'Aspiring Full-Stack Software Engineer & UI/UX enthusiast.',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: new Date('2026-02-01T10:30:00Z'),
        enrolledCourses: [],
        createdCourses: []
      };
      this.users.push(student);
      dirty = true;
    }

    if (dirty) {
      writeJSON('data_users.json', this.users);
    }

    // 2. Seed Courses if empty
    if (this.courses.length === 0) {
      this.courses = [
        {
          _id: 'course_101',
          title: 'Full-Stack Web Development: React, Node.js & MongoDB',
          description: 'Master modern full-stack web development from interactive component architectures with React 18 to scalable backend REST APIs with Express and Node.js. Learn database modeling, JWT authentication, and automated testing.',
          duration: '8 Weeks (64 Hours)',
          category: 'Programming',
          difficulty: 'Intermediate',
          price: 0,
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
          teacherId: teacher._id,
          isPublished: true,
          publishedAt: new Date('2026-02-10T08:00:00Z'),
          isActive: true,
          tags: ['React', 'NodeJS', 'Express', 'FullStack'],
          enrolledStudents: [
            { studentId: student._id, enrolledAt: new Date('2026-02-12T10:00:00Z'), progress: 65 }
          ],
          createdAt: new Date('2026-02-10T08:00:00Z')
        },
        {
          _id: 'course_102',
          title: 'UI/UX Design Masterclass: Figma to Interactive Prototypes',
          description: 'Learn the core principles of User Interface (UI) and User Experience (UX) design. Master user research, wireframing, color theory, design systems, and responsive prototype creation in Figma.',
          duration: '6 Weeks (40 Hours)',
          category: 'Design',
          difficulty: 'Beginner',
          price: 0,
          thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
          teacherId: teacher._id,
          isPublished: true,
          publishedAt: new Date('2026-02-15T09:00:00Z'),
          isActive: true,
          tags: ['UI', 'UX', 'Figma', 'ProductDesign'],
          enrolledStudents: [
            { studentId: student._id, enrolledAt: new Date('2026-02-16T11:30:00Z'), progress: 80 }
          ],
          createdAt: new Date('2026-02-15T09:00:00Z')
        },
        {
          _id: 'course_103',
          title: 'Data Science & Machine Learning with Python',
          description: 'Comprehensive introduction to data analysis, statistical modeling, machine learning algorithms, and predictive modeling using Python, Pandas, NumPy, Scikit-Learn, and Matplotlib.',
          duration: '10 Weeks (80 Hours)',
          category: 'Science',
          difficulty: 'Advanced',
          price: 0,
          thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          teacherId: teacher._id,
          isPublished: true,
          publishedAt: new Date('2026-02-20T10:00:00Z'),
          isActive: true,
          tags: ['Python', 'DataScience', 'MachineLearning', 'AI'],
          enrolledStudents: [
            { studentId: student._id, enrolledAt: new Date('2026-02-22T14:00:00Z'), progress: 45 }
          ],
          createdAt: new Date('2026-02-20T10:00:00Z')
        },
        {
          _id: 'course_104',
          title: 'Cloud Computing & DevOps: Docker, Kubernetes & AWS',
          description: 'Understand cloud architecture, containerization with Docker, orchestration with Kubernetes, and automated CI/CD deployment pipelines on Amazon Web Services (AWS).',
          duration: '7 Weeks (50 Hours)',
          category: 'Programming',
          difficulty: 'Intermediate',
          price: 0,
          thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
          teacherId: teacher._id,
          isPublished: true,
          publishedAt: new Date('2026-02-25T11:00:00Z'),
          isActive: true,
          tags: ['Cloud', 'DevOps', 'Docker', 'AWS'],
          enrolledStudents: [],
          createdAt: new Date('2026-02-25T11:00:00Z')
        },
        {
          _id: 'course_105',
          title: 'Digital Marketing Strategy & Growth Analytics',
          description: 'Learn how to build high-converting growth funnels, search engine optimization (SEO), social media campaigns, content strategy, and conversion rate optimization with real-world analytics.',
          duration: '4 Weeks (30 Hours)',
          category: 'Marketing',
          difficulty: 'Beginner',
          price: 0,
          thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
          teacherId: teacher._id,
          isPublished: true,
          publishedAt: new Date('2026-03-01T12:00:00Z'),
          isActive: true,
          tags: ['Marketing', 'SEO', 'Growth', 'Analytics'],
          enrolledStudents: [],
          createdAt: new Date('2026-03-01T12:00:00Z')
        }
      ];
      writeJSON('data_courses.json', this.courses);
    }

    // 3. Seed Enrollments if empty
    if (this.enrollments.length === 0) {
      this.enrollments = [
        {
          _id: 'enr_101',
          studentId: student._id,
          courseId: 'course_101',
          enrolledAt: new Date('2026-02-12T10:00:00Z'),
          status: 'active',
          progress: 65,
          lastAccessedAt: new Date(),
          isActive: true
        },
        {
          _id: 'enr_102',
          studentId: student._id,
          courseId: 'course_102',
          enrolledAt: new Date('2026-02-16T11:30:00Z'),
          status: 'active',
          progress: 80,
          lastAccessedAt: new Date(),
          isActive: true
        },
        {
          _id: 'enr_103',
          studentId: student._id,
          courseId: 'course_103',
          enrolledAt: new Date('2026-02-22T14:00:00Z'),
          status: 'active',
          progress: 45,
          lastAccessedAt: new Date(),
          isActive: true
        }
      ];
      writeJSON('data_enrollments.json', this.enrollments);
    }

    // 4. Seed Assignments if empty
    if (this.assignments.length === 0) {
      this.assignments = [
        {
          _id: 'assign_201',
          title: 'Build a Responsive REST API with Express & Node.js',
          description: 'Design and implement a clean REST API using Express. Implement JWT auth middleware, handle CRUD operations for resources, and write structured error responses with validation.',
          courseId: 'course_101',
          teacherId: teacher._id,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          maxMarks: 100,
          instructions: 'Submit your GitHub repository link or a zip file containing server.js, controllers, and routes with a comprehensive README.',
          submissionType: 'both',
          allowLateSubmission: true,
          latePenalty: 10,
          isPublished: true,
          isActive: true,
          createdAt: new Date('2026-02-14T10:00:00Z')
        },
        {
          _id: 'assign_202',
          title: 'React State Management & Dynamic Task Board',
          description: 'Build an interactive Kanban board using React 18 hooks (useState, useEffect, useReducer, or useContext). Users must be able to add, edit, and move cards across columns.',
          courseId: 'course_101',
          teacherId: teacher._id,
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
          maxMarks: 100,
          instructions: 'Include state persistence via localStorage and write component unit tests if possible.',
          submissionType: 'both',
          allowLateSubmission: false,
          latePenalty: 0,
          isPublished: true,
          isActive: true,
          createdAt: new Date('2026-02-20T10:00:00Z')
        },
        {
          _id: 'assign_203',
          title: 'Interactive Mobile App Wireframe in Figma',
          description: 'Create high-fidelity wireframes and an interactive prototype for a modern mobile shopping application in Figma. Adhere to design tokens, typography scales, and 8pt grid system.',
          courseId: 'course_102',
          teacherId: teacher._id,
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (past due)
          maxMarks: 100,
          instructions: 'Share your public Figma prototype link along with a PDF rationale describing the user flow decisions.',
          submissionType: 'both',
          allowLateSubmission: true,
          latePenalty: 5,
          isPublished: true,
          isActive: true,
          createdAt: new Date('2026-02-18T10:00:00Z')
        },
        {
          _id: 'assign_204',
          title: 'Exploratory Data Analysis with Pandas & Seaborn',
          description: 'Perform complete exploratory data analysis (EDA) on the provided dataset. Clean missing records, identify outliers, compute correlation matrices, and visualize key distributions.',
          courseId: 'course_103',
          teacherId: teacher._id,
          dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
          maxMarks: 100,
          instructions: 'Submit a clean Jupyter Notebook (.ipynb or PDF export) with inline visualizations and commentary.',
          submissionType: 'both',
          allowLateSubmission: false,
          latePenalty: 0,
          isPublished: true,
          isActive: true,
          createdAt: new Date('2026-02-22T10:00:00Z')
        }
      ];
      writeJSON('data_assignments.json', this.assignments);
    }

    // 5. Seed Submissions if empty
    if (this.submissions.length === 0) {
      this.submissions = [
        {
          _id: 'sub_301',
          assignmentId: 'assign_201',
          studentId: student._id,
          submittedAt: new Date('2026-02-18T15:30:00Z'),
          isLate: false,
          textContent: 'Here is my GitHub repository with the Express REST API implementation: https://github.com/alex-johnson/express-api-starter\n\nFeatures implemented:\n- Complete CRUD with auth middleware\n- Rate limiting & input validation\n- Postman collection included in /docs',
          attachments: [
            { filename: 'api_architecture.pdf', originalName: 'API_Architecture.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: 102400 }
          ],
          status: 'graded',
          grade: {
            marks: 95,
            maxMarks: 100,
            percentage: 95,
            gradedAt: new Date('2026-02-19T11:00:00Z'),
            gradedBy: teacher._id
          },
          feedback: 'Exceptional work, Alex! Your modular controller architecture and clear error handling responses are production-ready. Keep it up!',
          remarks: 'Top submission in cohort.'
        },
        {
          _id: 'sub_302',
          assignmentId: 'assign_203',
          studentId: student._id,
          submittedAt: new Date('2026-02-21T18:00:00Z'),
          isLate: false,
          textContent: 'Figma Prototype Link: https://figma.com/proto/demo-ecommerce-checkout\n\nDesigned complete checkout flow with micro-interactions, dark mode variants, and responsive auto-layout components.',
          attachments: [
            { filename: 'design_system_tokens.pdf', originalName: 'Design_System_Tokens.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: 154800 }
          ],
          status: 'graded',
          grade: {
            marks: 98,
            maxMarks: 100,
            percentage: 98,
            gradedAt: new Date('2026-02-22T09:30:00Z'),
            gradedBy: teacher._id
          },
          feedback: 'Outstanding attention to typographic scale, contrast ratios, and intuitive user friction reduction at checkout. Brilliant work!',
          remarks: 'Perfect execution.'
        },
        {
          _id: 'sub_303',
          assignmentId: 'assign_204',
          studentId: student._id,
          submittedAt: new Date('2026-02-24T14:20:00Z'),
          isLate: false,
          textContent: 'Attached Jupyter notebook export with comprehensive data cleaning, Pearson correlations, and Seaborn box plots highlighting customer attrition factors.',
          attachments: [
            { filename: 'churn_analysis_eda.pdf', originalName: 'Churn_Analysis_EDA.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: 312000 }
          ],
          status: 'graded',
          grade: {
            marks: 89,
            maxMarks: 100,
            percentage: 89,
            gradedAt: new Date('2026-02-25T16:00:00Z'),
            gradedBy: teacher._id
          },
          feedback: 'Great exploratory insights and thorough cleaning pipeline. To improve, try adding violin plots or pairplots for multimodal distributions.',
          remarks: 'Solid analysis.'
        },
        {
          _id: 'sub_304',
          assignmentId: 'assign_202',
          studentId: student._id,
          submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          isLate: false,
          textContent: 'Dynamic task board completed with column dragging, local storage persistence, and tag filtering.\nLive Demo: https://taskboard-demo.aimhigher.dev',
          attachments: [],
          status: 'submitted'
        }
      ];
      writeJSON('data_submissions.json', this.submissions);
    }

    // 6. Seed Grades if empty
    if (this.grades.length === 0) {
      this.grades = [
        {
          _id: 'grade_401',
          studentId: student._id,
          courseId: 'course_101',
          assignmentId: 'assign_201',
          submissionId: 'sub_301',
          teacherId: teacher._id,
          marks: 95,
          maxMarks: 100,
          percentage: 95,
          letterGrade: 'A',
          feedback: 'Exceptional work, Alex! Your modular controller architecture and clear error handling responses are production-ready. Keep it up!',
          remarks: 'Top submission in cohort.',
          gradedAt: new Date('2026-02-19T11:00:00Z'),
          isActive: true
        },
        {
          _id: 'grade_402',
          studentId: student._id,
          courseId: 'course_102',
          assignmentId: 'assign_203',
          submissionId: 'sub_302',
          teacherId: teacher._id,
          marks: 98,
          maxMarks: 100,
          percentage: 98,
          letterGrade: 'A+',
          feedback: 'Outstanding attention to typographic scale, contrast ratios, and intuitive user friction reduction at checkout. Brilliant work!',
          remarks: 'Perfect execution.',
          gradedAt: new Date('2026-02-22T09:30:00Z'),
          isActive: true
        },
        {
          _id: 'grade_403',
          studentId: student._id,
          courseId: 'course_103',
          assignmentId: 'assign_204',
          submissionId: 'sub_303',
          teacherId: teacher._id,
          marks: 89,
          maxMarks: 100,
          percentage: 89,
          letterGrade: 'B+',
          feedback: 'Great exploratory insights and thorough cleaning pipeline. To improve, try adding violin plots or pairplots for multimodal distributions.',
          remarks: 'Solid analysis.',
          gradedAt: new Date('2026-02-25T16:00:00Z'),
          isActive: true
        }
      ];
      writeJSON('data_grades.json', this.grades);
    }

    // 7. Seed Materials if empty (User Story 6)
    if (this.materials.length === 0) {
      this.materials = [
        {
          _id: 'mat_501',
          courseId: 'course_101',
          title: 'Full-Stack Architecture & Syllabus Roadmap',
          type: 'document',
          format: 'PDF',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          description: 'Comprehensive 8-week curriculum breakdown, recommended reading list, and developer environment setup guide.',
          duration: '15 min read',
          uploadedBy: teacher._id,
          createdAt: new Date('2026-02-10T10:00:00Z')
        },
        {
          _id: 'mat_502',
          courseId: 'course_101',
          title: 'REST API Design & Security Cheat Sheet',
          type: 'document',
          format: 'PDF',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          description: 'Quick reference guide for HTTP verbs, response codes, JWT handling, and input sanitation best practices.',
          duration: '10 min read',
          uploadedBy: teacher._id,
          createdAt: new Date('2026-02-12T11:00:00Z')
        },
        {
          _id: 'mat_503',
          courseId: 'course_101',
          title: 'Lecture Slides: Modern React Component Patterns',
          type: 'document',
          format: 'PPT',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          description: 'Slide deck exploring container vs presentational components, custom hooks, and suspense boundaries.',
          duration: '35 slides',
          uploadedBy: teacher._id,
          createdAt: new Date('2026-02-15T14:00:00Z')
        },
        {
          _id: 'mat_504',
          courseId: 'course_102',
          title: 'Figma Auto-Layout & Design Tokens Guide',
          type: 'document',
          format: 'PDF',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          description: 'Master component variants, auto-layout responsiveness, and standardized token naming conventions.',
          duration: '20 min read',
          uploadedBy: teacher._id,
          createdAt: new Date('2026-02-16T12:00:00Z')
        }
      ];
      writeJSON('data_materials.json', this.materials);
    }

    // 8. Seed Discussions if empty (User Story 6)
    if (this.discussions.length === 0) {
      this.discussions = [
        {
          _id: 'disc_601',
          courseId: 'course_101',
          title: 'Best practices for structuring controller files in Express?',
          content: 'Hello everyone! When building a larger REST application, is it preferred to keep business logic in separate service files or inside the controllers? Looking for recommendations on maintaining testability.',
          authorId: student._id,
          authorName: student.name,
          authorRole: 'student',
          authorAvatar: student.profileImage,
          createdAt: new Date('2026-02-17T14:30:00Z'),
          replies: [
            {
              _id: 'rep_701',
              authorId: teacher._id,
              authorName: teacher.name,
              authorRole: 'teacher',
              authorAvatar: teacher.profileImage,
              content: 'Great question, Alex! In enterprise apps, separating routes -> controllers (handling req/res) -> service layer (business logic & rules) -> data store makes unit testing much cleaner without needing to mock Express objects.',
              createdAt: new Date('2026-02-17T16:00:00Z')
            },
            {
              _id: 'rep_702',
              authorId: student._id,
              authorName: student.name,
              authorRole: 'student',
              authorAvatar: student.profileImage,
              content: 'Thank you Professor! That makes total sense. I will modularize the assignment controller accordingly.',
              createdAt: new Date('2026-02-17T16:45:00Z')
            }
          ]
        },
        {
          _id: 'disc_602',
          courseId: 'course_101',
          title: 'JWT Secret and Token Expiration strategies',
          content: 'What is the recommended token refresh strategy for single-page applications to ensure users are not abruptly logged out during prolonged sessions?',
          authorId: student._id,
          authorName: student.name,
          authorRole: 'student',
          authorAvatar: student.profileImage,
          createdAt: new Date('2026-02-23T11:00:00Z'),
          replies: [
            {
              _id: 'rep_703',
              authorId: teacher._id,
              authorName: teacher.name,
              authorRole: 'teacher',
              authorAvatar: teacher.profileImage,
              content: 'We typically pair short-lived access tokens (15-60m) with rotating refresh tokens stored in secure, HttpOnly cookies. We will cover this in Module 4!',
              createdAt: new Date('2026-02-23T13:15:00Z')
            }
          ]
        }
      ];
      writeJSON('data_discussions.json', this.discussions);
    }

    // 9. Seed Notifications if empty (User Story 6)
    if (this.notifications.length === 0) {
      this.notifications = [
        {
          _id: 'notif_801',
          userId: student._id,
          title: 'Assignment Graded',
          message: 'Your assignment "Build a Responsive REST API with Express" received a grade of 95/100 (A).',
          type: 'grade',
          link: '/student/grades',
          isRead: false,
          createdAt: new Date('2026-02-19T11:05:00Z')
        },
        {
          _id: 'notif_802',
          userId: student._id,
          title: 'New Assignment Published',
          message: 'Prof. Sarah Jenkins posted a new assignment: "React State Management & Dynamic Task Board".',
          type: 'assignment',
          link: '/student/assignments',
          isRead: false,
          createdAt: new Date('2026-02-20T10:05:00Z')
        },
        {
          _id: 'notif_803',
          userId: student._id,
          title: 'Discussion Reply',
          message: 'Prof. Sarah Jenkins replied to your discussion post "Best practices for structuring controller files".',
          type: 'discussion',
          link: '/student/courses/course_101',
          isRead: true,
          createdAt: new Date('2026-02-17T16:02:00Z')
        },
        {
          _id: 'notif_804',
          userId: teacher._id,
          title: 'New Assignment Submission',
          message: 'Alex Johnson submitted work for "React State Management & Dynamic Task Board".',
          type: 'submission',
          link: '/teacher/grading',
          isRead: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ];
      writeJSON('data_notifications.json', this.notifications);
    }
  }

  // Model wrapper to give documents Mongoose-like methods (save, toObject, populate)
  wrapModel(item) {
    if (!item) return null;
    const db = this;
    const model = { ...item };

    // Common Mongoose methods
    model.toObject = function () {
      const copy = { ...this };
      delete copy.toObject;
      delete copy.save;
      delete copy.populate;
      delete copy.enrollStudent;
      delete copy.updateProgress;
      delete copy.isOverdue;
      return copy;
    };

    model.save = async function () {
      // Determine collection by ID prefix or schema characteristics
      if (this._id) {
        if (this._id.startsWith('course_') || ('title' in this && 'duration' in this && 'teacherId' in this)) {
          db.updateCourse(this._id, this);
        } else if (this._id.startsWith('assign_') || ('maxMarks' in this && 'dueDate' in this)) {
          db.updateAssignment(this._id, this);
        } else if (this._id.startsWith('sub_') || ('assignmentId' in this && 'studentId' in this && 'textContent' in this)) {
          db.updateSubmission(this._id, this);
        } else if (this._id.startsWith('grade_') || ('letterGrade' in this && 'marks' in this)) {
          db.updateGrade(this._id, this);
        } else if (this._id.startsWith('enr_') || ('courseId' in this && 'studentId' in this && 'progress' in this)) {
          db.updateEnrollment(this._id, this);
        } else if ('email' in this && 'password' in this) {
          db.updateUser(this._id, this);
        }
      }
      return this;
    };

    model.populate = async function (field, select) {
      const chain = new QueryChain([this], db);
      chain.populate(field, select);
      const populated = chain.items[0];
      Object.assign(this, populated);
      return this;
    };

    // Course specific methods
    if ('enrolledStudents' in model) {
      model.enrollStudent = function (studentId) {
        if (!Array.isArray(this.enrolledStudents)) {
          this.enrolledStudents = [];
        }
        const exists = this.enrolledStudents.some(
          e => String(e.studentId?._id || e.studentId) === String(studentId)
        );
        if (!exists) {
          this.enrolledStudents.push({
            studentId,
            enrolledAt: new Date(),
            progress: 0
          });
          return true;
        }
        return false;
      };

      model.updateProgress = function (studentId, progress) {
        if (!Array.isArray(this.enrolledStudents)) return false;
        const enrollment = this.enrolledStudents.find(
          e => String(e.studentId?._id || e.studentId) === String(studentId)
        );
        if (enrollment) {
          enrollment.progress = Math.min(100, Math.max(0, progress));
          return true;
        }
        return false;
      };
    }

    // Assignment specific methods
    if ('dueDate' in model) {
      model.isOverdue = function () {
        return new Date() > new Date(this.dueDate);
      };
    }

    return model;
  }

  // --- USER METHODS ---
  getUsers() {
    return readJSON('data_users.json', this.users);
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find(u => String(u._id) === String(id)) || null;
  }

  findUser(query) {
    const users = this.getUsers();
    return users.find(u => matchesQuery(u, query)) || null;
  }

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      _id: generateId('user_'),
      ...userData,
      email: userData.email ? userData.email.trim().toLowerCase() : '',
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      enrolledCourses: userData.enrolledCourses || [],
      createdCourses: userData.createdCourses || []
    };
    users.push(newUser);
    this.users = users;
    writeJSON('data_users.json', users);
    return this.wrapModel(newUser);
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u => String(u._id) === String(id));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      this.users = users;
      writeJSON('data_users.json', users);
      return this.wrapModel(users[idx]);
    }
    return null;
  }

  // --- COURSE METHODS ---
  getCourses() {
    const courses = readJSON('data_courses.json', this.courses);
    const enrollments = readJSON('data_enrollments.json', this.enrollments);
    courses.forEach(c => {
      const courseEnrs = enrollments.filter(e => String(e.courseId) === String(c._id) && e.isActive !== false);
      if (courseEnrs.length > 0) {
        c.enrolledStudents = courseEnrs.map(e => ({
          studentId: e.studentId,
          enrolledAt: e.enrolledAt,
          progress: e.progress || 0,
          status: e.status || 'active'
        }));
      }
    });
    return courses;
  }

  getCourseById(id) {
    const courses = this.getCourses();
    return courses.find(c => String(c._id) === String(id)) || null;
  }

  findCourses(query = {}) {
    const courses = this.getCourses();
    const filtered = courses.filter(c => matchesQuery(c, query));
    return new QueryChain(filtered, this);
  }

  countCourses(query = {}) {
    const courses = this.getCourses();
    return courses.filter(c => matchesQuery(c, query)).length;
  }

  createCourse(courseData) {
    const courses = this.getCourses();
    const newCourse = {
      _id: generateId('course_'),
      ...courseData,
      isPublished: courseData.isPublished !== undefined ? courseData.isPublished : true,
      publishedAt: new Date(),
      isActive: true,
      enrolledStudents: courseData.enrolledStudents || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    courses.unshift(newCourse);
    this.courses = courses;
    writeJSON('data_courses.json', courses);

    // Also update teacher's created courses
    if (courseData.teacherId) {
      const user = this.getUserById(courseData.teacherId);
      if (user) {
        const createdCourses = user.createdCourses || [];
        if (!createdCourses.includes(newCourse._id)) {
          createdCourses.push(newCourse._id);
          this.updateUser(user._id, { createdCourses });
        }
      }
    }

    return this.wrapModel(newCourse);
  }

  updateCourse(id, updates) {
    const courses = this.getCourses();
    const idx = courses.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      courses[idx] = { ...courses[idx], ...updates, updatedAt: new Date() };
      this.courses = courses;
      writeJSON('data_courses.json', courses);
      return this.wrapModel(courses[idx]);
    }
    return null;
  }

  deleteCourse(id) {
    return this.updateCourse(id, { isActive: false });
  }

  // --- ENROLLMENT METHODS ---
  getEnrollments() {
    return readJSON('data_enrollments.json', this.enrollments);
  }

  findEnrollment(query) {
    const enrollments = this.getEnrollments();
    const item = enrollments.find(e => matchesQuery(e, query));
    return item ? this.wrapModel(item) : null;
  }

  findEnrollments(query = {}) {
    const enrollments = this.getEnrollments();
    const filtered = enrollments.filter(e => matchesQuery(e, query));
    return new QueryChain(filtered, this);
  }

  countEnrollments(query = {}) {
    const enrollments = this.getEnrollments();
    return enrollments.filter(e => matchesQuery(e, query)).length;
  }

  createEnrollment(data) {
    const enrollments = this.getEnrollments();
    const newEnrollment = {
      _id: generateId('enr_'),
      ...data,
      enrolledAt: new Date(),
      status: 'active',
      progress: 0,
      lastAccessedAt: new Date(),
      isActive: true
    };
    enrollments.push(newEnrollment);
    this.enrollments = enrollments;
    writeJSON('data_enrollments.json', enrollments);

    // Also add to course.enrolledStudents
    const course = this.getCourseById(data.courseId);
    if (course) {
      const enrolled = course.enrolledStudents || [];
      const alreadyIn = enrolled.some(e => String(e.studentId) === String(data.studentId));
      if (!alreadyIn) {
        enrolled.push({
          studentId: data.studentId,
          enrolledAt: new Date(),
          progress: 0
        });
        this.updateCourse(course._id, { enrolledStudents: enrolled });
      }
    }

    // Also update student's enrolledCourses
    const student = this.getUserById(data.studentId);
    if (student) {
      const enrolledList = student.enrolledCourses || [];
      if (!enrolledList.includes(data.courseId)) {
        enrolledList.push(data.courseId);
        this.updateUser(student._id, { enrolledCourses: enrolledList });
      }
    }

    return this.wrapModel(newEnrollment);
  }

  updateEnrollment(id, updates) {
    const enrollments = this.getEnrollments();
    const idx = enrollments.findIndex(e => String(e._id) === String(id));
    if (idx !== -1) {
      enrollments[idx] = { ...enrollments[idx], ...updates, lastAccessedAt: new Date() };
      this.enrollments = enrollments;
      writeJSON('data_enrollments.json', enrollments);
      return this.wrapModel(enrollments[idx]);
    }
    return null;
  }

  // --- ASSIGNMENT METHODS ---
  getAssignments() {
    return readJSON('data_assignments.json', this.assignments);
  }

  getAssignmentById(id) {
    const assignments = this.getAssignments();
    return assignments.find(a => String(a._id) === String(id)) || null;
  }

  findAssignments(query = {}) {
    const assignments = this.getAssignments();
    const filtered = assignments.filter(a => matchesQuery(a, query));
    return new QueryChain(filtered, this);
  }

  countAssignments(query = {}) {
    const assignments = this.getAssignments();
    return assignments.filter(a => matchesQuery(a, query)).length;
  }

  createAssignment(data) {
    const assignments = this.getAssignments();
    const newAssignment = {
      _id: generateId('assign_'),
      ...data,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      isActive: true,
      dueDate: new Date(data.dueDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    assignments.unshift(newAssignment);
    this.assignments = assignments;
    writeJSON('data_assignments.json', assignments);

    // Notify enrolled students about new assignment
    const course = this.getCourseById(data.courseId);
    if (course && Array.isArray(course.enrolledStudents)) {
      course.enrolledStudents.forEach(enr => {
        const studentId = enr.studentId?._id || enr.studentId;
        this.createNotification({
          userId: studentId,
          title: 'New Assignment Added',
          message: `New assignment "${newAssignment.title}" was posted in ${course.title}.`,
          type: 'assignment',
          link: '/student/assignments'
        });
      });
    }

    return this.wrapModel(newAssignment);
  }

  updateAssignment(id, updates) {
    const assignments = this.getAssignments();
    const idx = assignments.findIndex(a => String(a._id) === String(id));
    if (idx !== -1) {
      assignments[idx] = { ...assignments[idx], ...updates, updatedAt: new Date() };
      this.assignments = assignments;
      writeJSON('data_assignments.json', assignments);
      return this.wrapModel(assignments[idx]);
    }
    return null;
  }

  deleteAssignment(id) {
    return this.updateAssignment(id, { isActive: false });
  }

  // --- SUBMISSION METHODS ---
  getSubmissions() {
    return readJSON('data_submissions.json', this.submissions);
  }

  getSubmissionById(id) {
    const submissions = this.getSubmissions();
    return submissions.find(s => String(s._id) === String(id)) || null;
  }

  findSubmission(query) {
    const submissions = this.getSubmissions();
    const item = submissions.find(s => matchesQuery(s, query));
    return item ? this.wrapModel(item) : null;
  }

  findSubmissions(query = {}) {
    const submissions = this.getSubmissions();
    const filtered = submissions.filter(s => matchesQuery(s, query));
    return new QueryChain(filtered, this);
  }

  countSubmissions(query = {}) {
    const submissions = this.getSubmissions();
    return submissions.filter(s => matchesQuery(s, query)).length;
  }

  createSubmission(data) {
    const submissions = this.getSubmissions();
    const newSubmission = {
      _id: generateId('sub_'),
      ...data,
      submittedAt: new Date(),
      status: 'submitted',
      attachments: data.attachments || []
    };
    submissions.unshift(newSubmission);
    this.submissions = submissions;
    writeJSON('data_submissions.json', submissions);

    // Notify teacher
    const assignment = this.getAssignmentById(data.assignmentId);
    if (assignment && assignment.teacherId) {
      const student = this.getUserById(data.studentId);
      this.createNotification({
        userId: assignment.teacherId,
        title: 'New Assignment Submission',
        message: `${student ? student.name : 'A student'} submitted work for "${assignment.title}".`,
        type: 'submission',
        link: '/teacher/grading'
      });
    }

    return this.wrapModel(newSubmission);
  }

  updateSubmission(id, updates) {
    const submissions = this.getSubmissions();
    const idx = submissions.findIndex(s => String(s._id) === String(id));
    if (idx !== -1) {
      submissions[idx] = { ...submissions[idx], ...updates };
      this.submissions = submissions;
      writeJSON('data_submissions.json', submissions);
      return this.wrapModel(submissions[idx]);
    }
    return null;
  }

  // --- GRADE METHODS ---
  getGrades() {
    return readJSON('data_grades.json', this.grades);
  }

  getGradeById(id) {
    const grades = this.getGrades();
    return grades.find(g => String(g._id) === String(id)) || null;
  }

  findGrade(query) {
    const grades = this.getGrades();
    const item = grades.find(g => matchesQuery(g, query));
    return item ? this.wrapModel(item) : null;
  }

  findGrades(query = {}) {
    const grades = this.getGrades();
    const filtered = grades.filter(g => matchesQuery(g, query));
    return new QueryChain(filtered, this);
  }

  countGrades(query = {}) {
    const grades = this.getGrades();
    return grades.filter(g => matchesQuery(g, query)).length;
  }

  calculateLetterGrade(percentage) {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  createGrade(data) {
    const grades = this.getGrades();
    const marks = parseFloat(data.marks) || 0;
    const maxMarks = parseFloat(data.maxMarks) || 100;
    const percentage = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
    const letterGrade = this.calculateLetterGrade(percentage);

    const newGrade = {
      _id: generateId('grade_'),
      ...data,
      marks,
      maxMarks,
      percentage: Math.round(percentage * 100) / 100,
      letterGrade,
      gradedAt: new Date(),
      isActive: true
    };

    // Replace if already exists for this submission/student
    const existingIdx = grades.findIndex(
      g => String(g.studentId) === String(data.studentId) && String(g.assignmentId) === String(data.assignmentId)
    );
    if (existingIdx !== -1) {
      grades[existingIdx] = newGrade;
    } else {
      grades.unshift(newGrade);
    }

    this.grades = grades;
    writeJSON('data_grades.json', grades);

    // Update submission
    if (data.submissionId) {
      this.updateSubmission(data.submissionId, {
        status: 'graded',
        grade: {
          marks,
          maxMarks,
          percentage: newGrade.percentage,
          gradedAt: newGrade.gradedAt,
          gradedBy: data.teacherId
        },
        feedback: data.feedback,
        remarks: data.remarks
      });
    }

    // Notify student about grade
    const assignment = this.getAssignmentById(data.assignmentId);
    this.createNotification({
      userId: data.studentId,
      title: 'Assignment Graded',
      message: `Your submission for "${assignment ? assignment.title : 'Assignment'}" has been graded: ${marks}/${maxMarks} (${letterGrade}).`,
      type: 'grade',
      link: '/student/grades'
    });

    return this.wrapModel(newGrade);
  }

  updateGrade(id, updates) {
    const grades = this.getGrades();
    const idx = grades.findIndex(g => String(g._id) === String(id));
    if (idx !== -1) {
      const updated = { ...grades[idx], ...updates };
      if (updates.marks !== undefined || updates.maxMarks !== undefined) {
        const marks = parseFloat(updated.marks) || 0;
        const maxMarks = parseFloat(updated.maxMarks) || 100;
        updated.percentage = maxMarks > 0 ? Math.round((marks / maxMarks) * 10000) / 100 : 0;
        updated.letterGrade = this.calculateLetterGrade(updated.percentage);
      }
      grades[idx] = updated;
      this.grades = grades;
      writeJSON('data_grades.json', grades);
      return this.wrapModel(grades[idx]);
    }
    return null;
  }

  // Calculate overall performance & GPA for a student (User Story 5)
  calculateOverallStudentStats(studentId) {
    const studentGrades = this.getGrades().filter(
      g => String(g.studentId) === String(studentId) && g.isActive !== false
    );

    if (studentGrades.length === 0) {
      return {
        averagePercentage: 0,
        totalGrades: 0,
        totalMarks: 0,
        totalMaxMarks: 0,
        highestGrade: 0,
        lowestGrade: 0,
        overallGpa: 0,
        overallLetterGrade: 'N/A',
        gradeDistribution: []
      };
    }

    const totalMarks = studentGrades.reduce((sum, g) => sum + (g.marks || 0), 0);
    const totalMaxMarks = studentGrades.reduce((sum, g) => sum + (g.maxMarks || 100), 0);
    const averagePercentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 10000) / 100 : 0;

    const percentages = studentGrades.map(g => g.percentage);
    const highestGrade = Math.max(...percentages);
    const lowestGrade = Math.min(...percentages);

    // Calculate GPA on 4.0 scale
    const gpaMap = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    let totalGpaPoints = 0;
    const distributionMap = {};
    studentGrades.forEach(g => {
      const letter = g.letterGrade || this.calculateLetterGrade(g.percentage);
      totalGpaPoints += gpaMap[letter] !== undefined ? gpaMap[letter] : 3.0;
      distributionMap[letter] = (distributionMap[letter] || 0) + 1;
    });

    const overallGpa = Math.round((totalGpaPoints / studentGrades.length) * 100) / 100;
    const overallLetterGrade = this.calculateLetterGrade(averagePercentage);

    const gradeDistribution = Object.keys(distributionMap).map(grade => ({
      _id: grade,
      grade,
      count: distributionMap[grade]
    }));

    return {
      averagePercentage,
      totalGrades: studentGrades.length,
      totalMarks,
      totalMaxMarks,
      highestGrade,
      lowestGrade,
      overallGpa,
      overallLetterGrade,
      gradeDistribution
    };
  }

  // --- COURSE MATERIALS METHODS (User Story 6) ---
  getMaterials(courseId) {
    const list = readJSON('data_materials.json', this.materials);
    if (!courseId) return list;
    return list.filter(m => String(m.courseId) === String(courseId));
  }

  createMaterial(data) {
    const materials = readJSON('data_materials.json', this.materials);
    const newMaterial = {
      _id: generateId('mat_'),
      ...data,
      createdAt: new Date()
    };
    materials.push(newMaterial);
    this.materials = materials;
    writeJSON('data_materials.json', materials);
    return newMaterial;
  }

  deleteMaterial(id) {
    let materials = readJSON('data_materials.json', this.materials);
    materials = materials.filter(m => String(m._id) !== String(id));
    this.materials = materials;
    writeJSON('data_materials.json', materials);
    return true;
  }

  // --- DISCUSSIONS FORUM METHODS (User Story 6) ---
  getDiscussions(courseId) {
    const list = readJSON('data_discussions.json', this.discussions);
    if (!courseId) return list;
    return list.filter(d => String(d.courseId) === String(courseId));
  }

  createDiscussion(data) {
    const discussions = readJSON('data_discussions.json', this.discussions);
    const newDiscussion = {
      _id: generateId('disc_'),
      courseId: data.courseId,
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      authorName: data.authorName,
      authorRole: data.authorRole || 'student',
      authorAvatar: data.authorAvatar || '',
      createdAt: new Date(),
      replies: []
    };
    discussions.unshift(newDiscussion);
    this.discussions = discussions;
    writeJSON('data_discussions.json', discussions);
    return newDiscussion;
  }

  addReplyToDiscussion(discussionId, replyData) {
    const discussions = readJSON('data_discussions.json', this.discussions);
    const discussion = discussions.find(d => String(d._id) === String(discussionId));
    if (discussion) {
      const reply = {
        _id: generateId('rep_'),
        authorId: replyData.authorId,
        authorName: replyData.authorName,
        authorRole: replyData.authorRole || 'student',
        authorAvatar: replyData.authorAvatar || '',
        content: replyData.content,
        createdAt: new Date()
      };
      if (!Array.isArray(discussion.replies)) {
        discussion.replies = [];
      }
      discussion.replies.push(reply);
      this.discussions = discussions;
      writeJSON('data_discussions.json', discussions);

      // Notify original post author if someone else replies
      if (String(discussion.authorId) !== String(replyData.authorId)) {
        this.createNotification({
          userId: discussion.authorId,
          title: 'New Reply on Discussion',
          message: `${replyData.authorName} replied to your post: "${discussion.title.substring(0, 40)}..."`,
          type: 'discussion',
          link: `/student/courses/${discussion.courseId}`
        });
      }

      return reply;
    }
    return null;
  }

  // --- NOTIFICATION METHODS (User Story 6) ---
  getNotifications(userId) {
    const notifications = readJSON('data_notifications.json', this.notifications);
    return notifications
      .filter(n => String(n.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createNotification(data) {
    const notifications = readJSON('data_notifications.json', this.notifications);
    const newNotif = {
      _id: generateId('notif_'),
      ...data,
      isRead: false,
      createdAt: new Date()
    };
    notifications.unshift(newNotif);
    this.notifications = notifications;
    writeJSON('data_notifications.json', notifications);
    return newNotif;
  }

  markNotificationAsRead(id, userId) {
    const notifications = readJSON('data_notifications.json', this.notifications);
    const notif = notifications.find(n => String(n._id) === String(id) && String(n.userId) === String(userId));
    if (notif) {
      notif.isRead = true;
      this.notifications = notifications;
      writeJSON('data_notifications.json', notifications);
      return notif;
    }
    return null;
  }

  markAllNotificationsAsRead(userId) {
    const notifications = readJSON('data_notifications.json', this.notifications);
    notifications.forEach(n => {
      if (String(n.userId) === String(userId)) {
        n.isRead = true;
      }
    });
    this.notifications = notifications;
    writeJSON('data_notifications.json', notifications);
    return true;
  }
}

const localDB = new LocalDB();
module.exports = localDB;
