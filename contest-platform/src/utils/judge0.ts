import axios from "axios";

const executeCode = async (code: string, language: string) => {
    try {

        const res=await axios.post("", {code, language})
        
    } catch (error) {
        console.log("Error in executing the code", error)
        return null
    }
};
