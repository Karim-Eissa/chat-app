import axios from "axios";

export const axiosInstance=axios.create({
    baseURL:"https://chatty-egypt.duckdns.org/api",
    withCredentials:true
})