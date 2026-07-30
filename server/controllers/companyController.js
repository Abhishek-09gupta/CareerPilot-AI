const Company = require('../models/Company');

// Seeding function if no companies exist
const seedCompanies = async () => {
  const count = await Company.countDocuments();
  if (count > 0) return;

  const defaultCompanies = [
    {
      companyName: 'TCS',
      description: 'Tata Consultancy Services is a global leader in IT services, consulting, and business solutions.',
      interviewProcess: [
        'Round 1: Online Test (Aptitude, Coding, and English)',
        'Round 2: Technical Interview (Core CS, Coding, Project Details)',
        'Round 3: Managerial Interview',
        'Round 4: HR Interview'
      ],
      resources: [
        { title: 'TCS NQT Preparation Guide', link: 'https://www.tcs.com/' },
        { title: 'TCS Interview Experience Logs', link: 'https://www.geeksforgeeks.org/tag/tcs/' }
      ],
      salaryOverview: 'INR 3.36 LPA (Ninja) - INR 7.0 LPA (Digital) - INR 9.0 LPA (Prime)',
      roadmap: [
        'Step 1: Focus heavily on Quantitative Aptitude and logical reasoning for TCS NQT.',
        'Step 2: Solve basic coding questions (arrays, strings, recursion).',
        'Step 3: Revise Object-Oriented Programming (OOP) and SQL basics.',
        'Step 4: Prepare a solid walkthrough of your final year project.'
      ]
    },
    {
      companyName: 'Infosys',
      description: 'Infosys is a global leader in next-generation digital services and consulting.',
      interviewProcess: [
        'Round 1: Online Placement Test (Logical, Mathematical, Verbal, Pseudocode, and Puzzle Solving)',
        'Round 2: Technical & HR Interview (Combined or separate)'
      ],
      resources: [
        { title: 'Infosys InfyTQ Study Materials', link: 'https://www.infosys.com/' },
        { title: 'Practice Infosys Mock Papers', link: 'https://www.prepinsta.com/' }
      ],
      salaryOverview: 'INR 3.6 LPA (System Engineer) - INR 6.2 LPA (Specialist Programmer) - INR 9.5 LPA (Power Programmer)',
      roadmap: [
        'Step 1: Practice coding in Python/Java for Specialist Programmer roles.',
        'Step 2: Excel in pseudocode tracing and compiler dry-running.',
        'Step 3: Understand DBMS, Operating Systems, and SDLC models.',
        'Step 4: Practice behavioral questions (teamwork, leadership, career aspirations).'
      ]
    },
    {
      companyName: 'Accenture',
      description: 'Accenture is a leading global professional services company, providing a broad range of services in strategy, consulting, interactive, technology, and operations.',
      interviewProcess: [
        'Round 1: Cognitive and Technical Assessment (Aptitude, Pseudo code, Networking, Security, Cloud)',
        'Round 2: Coding Assessment (2 coding questions, mandatory to pass for next stages)',
        'Round 3: Communication Assessment (automated voice evaluation)',
        'Round 4: Combined Technical and HR Interview'
      ],
      resources: [
        { title: 'Accenture Technical Syllabus', link: 'https://www.accenture.com/' }
      ],
      salaryOverview: 'INR 4.5 LPA (Associate Software Engineer) - INR 6.5 LPA (Advanced ASE)',
      roadmap: [
        'Step 1: Review MS Office, Cloud Fundamentals, and Computer Networks.',
        'Step 2: Master Basic and Medium level coding problems.',
        'Step 3: Practice spoken English for the automated communication round.',
        'Step 4: Review project milestones and prepare responses for situational questions.'
      ]
    },
    {
      companyName: 'Capgemini',
      description: 'Capgemini is a global leader in partnering with companies to transform and manage their business by harnessing the power of technology.',
      interviewProcess: [
        'Round 1: Pseudo code, English Communication, and Game-based Aptitude Test',
        'Round 2: Technical Interview',
        'Round 3: HR Interview'
      ],
      resources: [
        { title: 'Capgemini Placement syllabus', link: 'https://www.capgemini.com/' }
      ],
      salaryOverview: 'INR 4.0 LPA - INR 7.5 LPA',
      roadmap: [
        'Step 1: Practice Game-based tests (Grid challenges, motion challenges, deductive reasoning).',
        'Step 2: Master standard pseudo code questions (dry running code fragments).',
        'Step 3: Strengthen understanding of Data Structures and Algorithms.',
        'Step 4: Build soft skills for the HR panel evaluation.'
      ]
    }
  ];

  await Company.insertMany(defaultCompanies);
  console.log('Seeded initial company preparation roadmap profiles.');
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
exports.getCompanies = async (req, res) => {
  try {
    // Run self-seeder if database is empty
    await seedCompanies();

    const companies = await Company.find({});
    res.json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get company details by ID
// @route   GET /api/companies/:id
// @access  Private
exports.getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company roadmap profile not found',
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
