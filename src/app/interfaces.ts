export interface User {
  status: number,
  email: string,
  username: string
}

export interface Gantts {
  [index: number]: {
    blocks: {
      width: string,
      status: number,
      time: string,
    },
    datum: number
  }
}

export interface Poke {
  message: string,
  sender: string,
  time: number,
  pid: string
}