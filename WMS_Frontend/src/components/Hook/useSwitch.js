import { useState } from 'react'

export default (initialState) => {
    let [isOpen, setOpen] = useState(initialState)
    const open = () => setOpen(true),
        close = () => setOpen(false)
    return [isOpen, open, close]
}
