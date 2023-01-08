import { Task } from "~~/interfaces/general";

function genRandomStr(): string {
  const alphabet: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let str: string = "";

  for (let i: number = 0; i < 10; i++) {
    str += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return str;
}

export default function () {
  const tasks = useState<Task[]>('tasks', () => null)
  const tags = useState<{ name: string; color: string }[]>('task-tags', () => [
    {
      name: 'Important ASAP',
      color: '#e5f1ff'
    },
    {
      name: 'Offline Meeting',
      color: '#FDCFA4'
    },
    {
      name: 'Virtual Meeting',
      color: '#F9E9C3'
    },
    {
      name: 'ASAP',
      color: '#AFEBDB'
    },
    {
      name: 'Client Related',
      color: '#CBF1C2'
    },
    {
      name: 'Self Task',
      color: '#CFCEF9'
    },
    {
      name: 'Appointments',
      color: '#F9E0FD'
    },
    {
      name: 'Court Related',
      color: '#9DD0ED'
    },
  ])

  return { tasks, tags }
}