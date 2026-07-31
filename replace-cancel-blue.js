const fs = require('fs');
const path = require('path');

const targetClassesBase = 'rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors';
const targetClassesText = 'rounded-lg px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition-colors';
const targetClassesBaseSm = 'rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors';

const filesToUpdate = [
  {
    file: 'src/components/ui/ConfirmationModal.tsx',
    search: 'className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"',
    replace: `className="${targetClassesText}"`
  },
  {
    file: 'src/components/task/TaskEditorModal.tsx',
    search: 'className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"',
    replace: `className="${targetClassesBase}"`
  },
  {
    file: 'src/components/task/TaskDetailsModal.tsx',
    search: 'className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"',
    replace: `className="${targetClassesBase}"`
  },
  {
    file: 'src/components/leave/LeaveForm.tsx',
    search: 'className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"',
    replace: `className="${targetClassesBaseSm}"`
  },
  {
    file: 'src/components/employee/EmployeeCard.tsx',
    search: 'className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"',
    replace: `className="${targetClassesText} cursor-pointer"`
  },
  {
    file: 'src/components/employee/EmployeeCard.tsx',
    search: 'className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"',
    replace: `className="${targetClassesBase} cursor-pointer"`
  },
  {
    file: 'src/components/chatbot/ChatsListView.tsx',
    search: 'className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"',
    replace: `className="${targetClassesBase}"`
  },
  {
    file: 'src/components/chatbot/ArchiveView.tsx',
    search: 'className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"',
    replace: `className="${targetClassesBase}"`
  },
  {
    file: 'src/components/calendar/HolidayForm.tsx',
    search: 'className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"',
    replace: `className="${targetClassesBaseSm}"`
  },
  {
    file: 'src/components/communication/CommunicationHub.tsx',
    search: 'className="rounded-xl px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"',
    replace: 'className="rounded-xl px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"'
  }
];

filesToUpdate.forEach(({ file, search, replace }) => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(search)) {
      content = content.replaceAll(search, replace);
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${file}`);
    } else {
      console.log(`Search string not found in ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
