interface User{
    id: string,
    name: string,
    role: string
}

declare global{
    namespace express{
        interface Request{

            user?:User
        }
    }
}

export {}