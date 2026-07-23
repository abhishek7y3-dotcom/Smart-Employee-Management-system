export interface FastTrackEntry {
  id: string;
  intentKeywords: string[];
  canonicalQuestion: string;
  answer: string;
  requiresRole?: 'admin' | 'employee' | 'any';
  lastUpdated: Date;
}

export const FAST_TRACK_DATA: FastTrackEntry[] = [
  {
    id: 'leave_policy',
    intentKeywords: ['leave', 'policy', 'apply', 'sick', 'casual', 'rules'],
    canonicalQuestion: 'What is the leave policy and how do I apply?',
    answer: '**Leave Policy Overview:**\n- **Casual Leaves (CL):** 12 per year.\n- **Sick Leaves (SL):** 10 per year.\n- **Earned Leaves (EL):** 15 per year.\n\n*To apply for leave, navigate to the Leave Dashboard and submit a request.*',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'payslip_download',
    intentKeywords: ['payslip', 'salary', 'download', 'pay', 'slip', 'slip'],
    canonicalQuestion: 'How can I download my payslip?',
    answer: '**Payslip Access:**\nYour payslips are automatically generated on the 1st of every month. You can download them by navigating to the **Payroll Section** in your dashboard and clicking the "Download PDF" icon.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'holiday_calendar',
    intentKeywords: ['holiday', 'calendar', 'public', 'holidays', 'list', 'off'],
    canonicalQuestion: 'What are the upcoming public holidays?',
    answer: '**Holiday Calendar:**\nYou can find the complete list of mandatory and restricted holidays for the current year in the "Company Documents" section. The next upcoming public holiday is usually highlighted on your main dashboard.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'task_status_check',
    intentKeywords: ['task', 'status', 'check', 'my', 'pending', 'tasks', 'update'],
    canonicalQuestion: 'How do I check my task status?',
    answer: '**Task Management:**\nTo view your pending tasks, visit the **Tasks Tab**. You can update the status of any task by clicking on it and selecting "In Progress" or "Completed".',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'it_support_contact',
    intentKeywords: ['it', 'support', 'helpdesk', 'laptop', 'hardware', 'issue', 'network'],
    canonicalQuestion: 'How do I contact IT support?',
    answer: '**IT Support:**\nIf you are facing hardware or network issues, please raise a ticket on the IT Helpdesk portal or email **it-support@company.com**.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'working_hours',
    intentKeywords: ['working', 'hours', 'office', 'timing', 'time', 'shift'],
    canonicalQuestion: 'What are the standard office timings?',
    answer: '**Standard Working Hours:**\nOur standard office timings are from **9:30 AM to 6:30 PM**, Monday through Friday. If you are assigned a specific shift, please refer to your roster.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'wfh_policy',
    intentKeywords: ['wfh', 'work', 'from', 'home', 'remote', 'policy'],
    canonicalQuestion: 'What is the Work From Home (WFH) policy?',
    answer: '**WFH Policy:**\nEmployees are eligible for up to **2 days of Work From Home per month**, subject to manager approval. Remote work requires a stable internet connection and active availability during core hours.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'admin_dashboard_help',
    intentKeywords: ['admin', 'panel', 'manage', 'all', 'users', 'broadcast', 'announcement'],
    canonicalQuestion: 'How do I broadcast an announcement?',
    answer: '**Admin Announcement Protocol:**\nAs an admin, you can broadcast announcements to the entire company using the "Communication" module in your admin dashboard. These will appear instantly for all users.',
    requiresRole: 'admin',
    lastUpdated: new Date()
  },
  {
    id: 'forgot_password',
    intentKeywords: ['forgot', 'password', 'reset', 'change', 'unlock', 'account'],
    canonicalQuestion: 'How do I reset my password?',
    answer: '**Password Reset:**\nIf you forgot your password, please go to the Login screen and click "Forgot Password". You will receive an email with a secure reset link. If your account is locked, please contact IT Support.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'create_task_help',
    intentKeywords: ['how', 'create', 'task', 'assign', 'new', 'work', 'make'],
    canonicalQuestion: 'How do I create or assign a new task?',
    answer: '**Creating a Task:**\nTo create a task, navigate to the **Task Board** and click the "+ New Task" button. Fill in the title, description, deadline, and assign it to a team member. \n*Note: Only Admins or Managers can assign tasks to other users.*',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'expense_reimbursement',
    intentKeywords: ['expense', 'claim', 'reimbursement', 'bill', 'submit', 'money'],
    canonicalQuestion: 'How do I claim expenses or reimbursements?',
    answer: '**Expense Claims:**\nYou can submit expense claims via the "Finance" tab on your dashboard. Please upload clear images of your bills. Claims submitted before the 20th are processed in the current month\'s payroll.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'health_insurance',
    intentKeywords: ['health', 'insurance', 'medical', 'policy', 'mediclaim', 'hospital'],
    canonicalQuestion: 'What are the health insurance details?',
    answer: '**Health Insurance:**\nAll full-time employees are covered under the corporate group health insurance policy (Coverage: ₹5,000,000). You can download your E-Card and view the list of network hospitals from the HR Portal.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'parental_leave',
    intentKeywords: ['maternity', 'paternity', 'leave', 'parental', 'baby', 'child'],
    canonicalQuestion: 'What is the maternity/paternity leave policy?',
    answer: '**Parental Leave:**\n- **Maternity Leave:** 26 weeks of paid leave.\n- **Paternity Leave:** 15 days of paid leave.\nPlease notify HR at least 30 days in advance to process your parental leave.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'notice_period',
    intentKeywords: ['notice', 'period', 'resign', 'resignation', 'quit', 'leave', 'company'],
    canonicalQuestion: 'What is the notice period policy?',
    answer: '**Notice Period:**\nThe standard notice period is **60 days** after confirmation, and **30 days** during the probation period. Resignation requests must be submitted via the HR portal and approved by your direct manager.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'performance_review',
    intentKeywords: ['performance', 'review', 'appraisal', 'promotion', 'cycle', 'rating'],
    canonicalQuestion: 'When is the performance review cycle?',
    answer: '**Performance Appraisals:**\nOur company follows an annual performance review cycle conducted in **April**. Mid-year check-ins are conducted in October. Promotions and salary revisions are strictly tied to your April appraisal rating.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'it_equipment',
    intentKeywords: ['laptop', 'upgrade', 'equipment', 'mouse', 'keyboard', 'monitor', 'request'],
    canonicalQuestion: 'How do I request a new laptop or IT equipment?',
    answer: '**IT Equipment Request:**\nTo request new hardware (monitor, keyboard, mouse) or a laptop upgrade, please raise a ticket in the IT Helpdesk. Hardware upgrades require approval from your Reporting Manager.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'office_wifi',
    intentKeywords: ['wifi', 'password', 'internet', 'network', 'connect', 'office'],
    canonicalQuestion: 'What is the office WiFi password?',
    answer: '**Office Network:**\n- **Network Name (SSID):** Company_Corp_5G\n- **Password:** You must use your unique Employee ID and Windows Password to authenticate to the corporate WiFi. Guest WiFi details are available at the reception.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'dress_code',
    intentKeywords: ['dress', 'code', 'wear', 'clothes', 'attire', 'casual', 'friday'],
    canonicalQuestion: 'What is the office dress code?',
    answer: '**Dress Code:**\nWe follow a **Smart Casual** dress code from Monday to Thursday. Fridays are **Casual Fridays**. Please avoid wearing ripped jeans, flip-flops, or overly casual attire in the office.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'update_bank_details',
    intentKeywords: ['bank', 'account', 'details', 'update', 'change', 'salary', 'account'],
    canonicalQuestion: 'How do I update my salary bank account details?',
    answer: '**Updating Bank Details:**\nYou can change your salary bank account by navigating to **Profile Settings -> Financial Info**. You will need to upload a cancelled cheque or bank statement as proof. Changes take 7 working days to reflect.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'salary_slip_password',
    intentKeywords: ['password', 'open', 'unlock', 'payslip', 'salary', 'slip', 'pdf'],
    canonicalQuestion: 'What is the password to open my payslip PDF?',
    answer: '**Payslip Password:**\nYour payslip PDF is password protected. The password is your **PAN card number in uppercase** followed by your **Date of Birth in DDMMYYYY format**. (Example: ABCDE1234F01011990)',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'company_address',
    intentKeywords: ['address', 'location', 'office', 'where', 'situated', 'headquarters', 'hq'],
    canonicalQuestion: 'What is the office address?',
    answer: '**Office Location:**\nOur Headquarters is located at:\n*Tech Park, Building 3, Floor 4, Silicon Avenue.*\nPlease carry your ID card for building entry.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'tax_declaration',
    intentKeywords: ['tax', 'declaration', 'tds', 'form', '16', 'save', 'investment'],
    canonicalQuestion: 'How do I submit my tax declaration (IT Declaration)?',
    answer: '**Tax Declarations:**\nInvestment Proofs and Tax Declarations can be submitted via the **Finance -> Tax Portal**. The window for submitting proofs opens every year in January. Please ensure you upload clear PDFs of your investments.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'referral_policy',
    intentKeywords: ['refer', 'referral', 'bonus', 'friend', 'job', 'hire', 'vacancy'],
    canonicalQuestion: 'What is the employee referral policy?',
    answer: '**Employee Referral Program:**\nWe encourage you to refer friends for open positions! You can earn a referral bonus of **₹15,000** if your referred candidate is hired and completes their 3-month probation. Check the "Careers" tab for open roles.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'gym_allowance',
    intentKeywords: ['gym', 'wellness', 'allowance', 'health', 'fitness', 'reimburse'],
    canonicalQuestion: 'Can I claim gym or wellness allowance?',
    answer: '**Wellness Allowance:**\nEmployees are eligible for a wellness allowance of up to **₹2,000 per month** for gym memberships or fitness classes. Submit your monthly receipts in the Expense section under the "Wellness" category.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'overtime_policy',
    intentKeywords: ['overtime', 'ot', 'extra', 'hours', 'weekend', 'work', 'pay'],
    canonicalQuestion: 'What is the overtime policy?',
    answer: '**Overtime Policy:**\nOvertime pay is applicable for employees working beyond 45 hours a week, subject to prior manager approval. Weekend shifts authorized by managers are eligible for compensatory off (Comp-Off) days.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'business_travel',
    intentKeywords: ['travel', 'business', 'flight', 'ticket', 'hotel', 'booking', 'trip'],
    canonicalQuestion: 'How do I book business travel?',
    answer: '**Business Travel:**\nAll corporate travel (flights, hotels) must be booked via our internal Travel Portal at least 14 days in advance. Ensure your Reporting Manager has approved your travel request on the system first.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'id_card_replacement',
    intentKeywords: ['id', 'card', 'lost', 'stolen', 'replace', 'new', 'badge'],
    canonicalQuestion: 'How do I get a new ID card if I lost mine?',
    answer: '**ID Card Replacement:**\nIf you lose your ID badge, please report it immediately to HR and IT security to deactivate the old one. A replacement fee of ₹500 will be deducted from your next payroll, and a new card will be issued in 2 days.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'training_reimbursement',
    intentKeywords: ['training', 'course', 'learn', 'certify', 'certification', 'udemy', 'reimburse'],
    canonicalQuestion: 'Will the company pay for my courses and certifications?',
    answer: '**Learning & Development:**\nThe company provides an L&D budget of **₹10,000 per year** per employee for professional courses (Udemy, AWS certifications, etc.). You must get manager approval before purchasing the course to claim reimbursement.',
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'emergency_contacts',
    intentKeywords: ['emergency', 'contact', 'hr', 'admin', 'help', 'urgent', 'phone'],
    canonicalQuestion: 'Who do I contact in an emergency?',
    answer: '**Emergency Contacts:**\n- **HR Head:** hr-emergency@company.com\n- **IT Security:** 1800-IT-HELP\n- **Office Admin:** admin-desk@company.com\n*If you are facing a medical emergency, please inform your manager as soon as possible.*',
    requiresRole: 'any',
    lastUpdated: new Date()
  }
];
