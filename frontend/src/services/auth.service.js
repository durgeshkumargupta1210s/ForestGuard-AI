import api from "./api";



// Login

export const login = async (data) => {

    const response = await api.post(

        "/auth/login",

        data

    );

    return response.data;

};



// Register

export const register = async (data) => {

    const response = await api.post(

        "/auth/register",

        data

    );

    return response.data;

};