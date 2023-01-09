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
  const { $fetch } = useNuxtApp()

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

  const loadTasks = async (): Promise<Task[]> => {
    const tasksRaw: string = localStorage.getItem('tasks')
    if (!tasksRaw) {
      tasks.value = [
        {
          _id: "0",
          completed: false,
          title:
            "Set up documentation report for several Cases : Case 145443, Case 192829 and Case 182203",
          date: new Date().toISOString(),
          description:
            "Homeworks needed to be checked are as follows : Client Profile Questionnaire, Passport Requirements and Images, Personal Documents.",
        },
        {
          _id: "1",
          completed: false,
          title: "Set up documentation report",
          date: new Date(2023, 0, 7).toISOString(),
          description:
            "Homeworks needed to be checked are as follows : Client Profile Questionnaire, Passport Requirements and Images, Personal Documents.",
        },
        {
          _id: "2",
          completed: false,
          title: "Set up documentation report",
          date: new Date(2023, 0, 10).toISOString(),
          description:
            "Homeworks needed to be checked are as follows : Client Profile Questionnaire, Passport Requirements and Images, Personal Documents.",
        },
        {
          _id: "3",
          completed: false,
          title: "Set up documentation report",
          date: new Date().toISOString(),
          description:
            "Homeworks needed to be checked are as follows : Client Profile Questionnaire, Passport Requirements and Images, Personal Documents.",
        },
      ]
      localStorage.setItem('tasks', JSON.stringify(tasks.value))
    } else {
      tasks.value = JSON.parse(tasksRaw) as Task[]
    }
    return tasks.value
  }

  const addTask = async (): Promise<Task> => {
    const task: Task = {
      _id: genRandomStr(),
      completed: false
    }

    tasks.value.push(task)
    localStorage.setItem('tasks', JSON.stringify(tasks.value))

    return task
  }
  const editTask = async (payload: Task): Promise<Task> => {
    const index: number = tasks.value.findIndex((a) => a._id === payload._id)

    if (index > -1) {
      tasks.value[index] = payload

      localStorage.setItem('tasks', JSON.stringify(tasks.value))

      return tasks.value[index]
    } return null
  }
  const deleteTask = async (_id: string): Promise<boolean> => {
    const index: number = tasks.value.findIndex((a) => a._id === _id)
    if (index > -1) {
      tasks.value.splice(index, 1)

      localStorage.setItem('tasks', JSON.stringify(tasks.value))

      return true
    } return false
  }
  const changeTasks = (payload: Task[]): void => {
    if (payload?.length === tasks.value?.length) {
      tasks.value = payload
      localStorage.setItem('tasks', JSON.stringify(tasks.value))
    }
  }

  return { tasks, tags, loadTasks, addTask, editTask, deleteTask, changeTasks }
}