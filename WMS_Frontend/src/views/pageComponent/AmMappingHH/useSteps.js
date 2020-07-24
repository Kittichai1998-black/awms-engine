import { useState } from 'react'

export default (initialState) => {
    const [activeStep, setActiveStep] = useState(initialState)
    const handleNext = () => setActiveStep(activeStep + 1),
        handleBack = () => setActiveStep(activeStep - 1),
        handleReset = () => setActiveStep(0)
    return [activeStep, handleNext, handleBack, handleReset]
}
