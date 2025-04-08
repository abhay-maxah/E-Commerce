import axios from "../lib/axios";

export const googleAuth = (code) =>{
  try{
    axios.get(`/auth/login/google?code=${code}`)
  }catch(error){
    console.log("Error From FrontEnd" , error)
  }
}