export type ViewMode = 'desktop' | 'mobile'

export interface Address {
  _id?: string
  city: string
  country: string
  state: string
  line1: string
  line2: string
  postal_code: string
}

export interface Dimension {
  weight: number
  length: number
  width: number
  height: number
}

export interface CanvasFont {
  family: string
  variants: string[]
  subsets: string[]
  version: string
  lastModified: string
  files: { [K: string]: string }
  category: string
  kind: string
}
export interface LayerCornerRadius {
  topLeft?: number
  topRight?: number
  bottomLeft?: number
  bottomRight?: number
}
export interface LayerAction {
  type:
  | "resize-top-left"
  | "resize-top-right"
  | "resize-bottom-left"
  | "resize-bottom-right"
  | "resize-top"
  | "resize-right"
  | "resize-bottom"
  | "resize-left"
  | "resize-start"
  | "resize-end"
  | "move"
  bounds: [[number, number], [number, number]]
}
export interface LayerMask {
  mask: {
    url: string
    w: number
    h: number
    x?: number
    y?: number
    image?: HTMLImageElement
  },
  background?: {
    url: string
    w: number
    h: number
    image?: HTMLImageElement
  }
}
export interface Layer {
  id?: string
  overlay?: boolean
  type?: "rectangle" | "ellipse" | "line" | "text" | "image" | "outline" | "outline-line" | "outline-text"
  name?: string
  selected?: boolean
  hidden?: boolean
  x: number
  y: number
  w?: number
  h?: number
  r?: number
  scale?: number
  image?: HTMLImageElement
  shape?: {
    radius?: LayerCornerRadius
    fill?: {
      color: string
      alpha: number
    }
    stroke?: {
      color: string
      alpha: number
      width: number
      dash: number
      gap: number
    }
  }
  font?: {
    family: string
    size: number
    variant: string
  }
}

export interface InputSwitchOption {
  options: [string, string]
  model: string
  disabled?: boolean
}
export interface InputColorOption {
  color: string
  alpha: number
}
export interface InputToggleOption {
  model: boolean
  disabled?: boolean
}
export interface InputFileOption {
  file: File
  type?: 'any' | 'image'
  disabled?: boolean
  label?: string
  image_url?: string
  width?: number
  height?: number
  accept?: string
}
export interface InputImageOption {
  label: string
  limit: number
  file: (File | string)[]
}
export interface InputOption {
  name: string
  placeholder: string
  model: string
  prefix?: string
  icon?: string
  color?: string
  value?: string
  label?: string
  error?: string
  type?: 'email' | 'password' | 'tel' | 'number' | 'hour' | 'minute'
  disabled?: boolean
  replying?: boolean
  options?: (string | {
    name: string
    value: string
  })[]
}
export interface InputDateOption {
  name?: string
  placeholder?: string
  model: string
  value?: string
  icon?: string
  label?: string
  error?: string
  disabled?: boolean
  threshold?: Date
  available?: number[]
}
export interface InputCodeOption {
  name: string
  length: number
  model: string
  disabled?: boolean
}
export interface InputSearchOption {
  name: string
  placeholder: string
  model: string
  type?: 'primary' | 'secondary'
}
export interface InputGeneric<T> {
  name: string
  placeholder: string
  model: string
  value?: T
  icon?: string
  label?: string
  error?: string
  type?: 'email' | 'password' | 'tel' | 'number'
  disabled?: boolean
  options?: (string | {
    name: string
    value: T
  })[]
}

export interface Chat {
  _id: string;
  title: string;
  type: "group" | "individual";
  member?: {
    _id: string
    name_color: string
    background_color: string
  }[]
  read?: boolean;
  message?: ChatMessage;
}
export interface ChatMessage {
  _id: string
  chat_id: string
  text: string;
  date: string | Date;
  read: boolean;
  from: {
    _id: string;
    name: string;
  };
  edited?: boolean
  reply_id?: string
  reply?: {
    _id: string
    text: string;
    date: string | Date;
    from: {
      _id: string;
      name: string;
    };
  }
}

export interface Task {
  _id: string
  title?: string
  date?: Date | string
  description?: string
  tags?: {
    name: string;
    color: string
  }[]
  completed: boolean
}