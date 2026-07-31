const fs = require('fs');
const path = require('path');

const targetClassesBase = 'rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors';
const targetClassesText = 'rounded-lg px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition-colors';
const targetClassesBaseSm = 'rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors';

const files = [
  'src/components/ui/ConfirmationModal.tsx',
  'src/components/task/TaskEditorModal.tsx',
  'src/components/task/TaskDetailsModal.tsx',
  'src/components/leave/LeaveForm.tsx',
  'src/components/chatbot/ChatsListView.tsx',
  'src/components/chatbot/ArchiveView.tsx',
  'src/components/calendar/HolidayForm.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // For text-xs zinc-700 -> blue
    content = content.replace(/className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"/g, 
      `className="${targetClassesText}"`);
      
    // For bg-zinc-100 text-xs -> blue
    content = content.replace(/className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"/g,
      `className="${targetClassesBase}"`);
      
    // For bg-zinc-100 text-sm -> blue
    content = content.replace(/className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"/g,
      `className="${targetClassesBaseSm}"`);
      
    fs.writeFileSync(fullPath, content);
    console.log(`Processed ${file}`);
  }
});
