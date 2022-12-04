import React, {useEffect, useState} from "react";

import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const Users =() => {
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const [loadedUser, setLoadedUser] = useState();
    //fetch as soon as component rerender
    useEffect(()=> {
        
        const fetchUsers = async () =>{
            
            try{
                const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/users`); //fetch default request is GET
                
                setLoadedUser(responseData.users);
                
            }catch(err){}
        };
        fetchUsers();
        
    },[sendRequest]); //bc sendRequest comes from outsie useEffect


    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            {isLoading && <div className="center">
                <LoadingSpinner /> 
            </div>}
            {!isLoading && loadedUser && <UsersList items = {loadedUser}/> }
        </React.Fragment>//delegate the rendering of list of users to the UsersList component
    ) 
}

export default Users;