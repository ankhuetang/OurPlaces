import React, {useState, useContext} from "react";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import { VALIDATOR_EMAIL,VALIDATOR_REQUIRE , VALIDATOR_MINLENGTH} from "../../shared/util/validators";

import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./Auth.css"
const Auth = () => {
        const auth = useContext(AuthContext);
        const [isLoginMode, setIsLoginMode] = useState(true);

        const{isLoading, error, sendRequest, clearError} =  useHttpClient();

        const [formState, inputHandler, setFormData] =  useForm(
            {
                email: {
                    value: "",
                    isValid: false
                },
                password: {
                    value: "",
                    isValid: false
                }
            }, false 
        );
        
        //set prevMode nguoc lai
        const switchModeHandler = () => {
            //if not in login mode
            if(!isLoginMode){
                setFormData({
                    ...formState.inputs,
                    name: undefined,
                    image: undefined
                }, formState.inputs.email.isValid && formState.inputs.password.isValid)
            }else{
                setFormData({
                    ...formState.inputs,
                    name: {
                        value: "",
                        isValid: false
                    },
                    image:{
                        value:null,
                        isValid: false
                    }
                }, false)
            }
            setIsLoginMode(prevMode => !prevMode );
        };

        //authSubmithandler
        const authSubmitHandler = async event => {
            event.preventDefault();
            
            if(isLoginMode){

                try{ 
                    //fetch data from backend
                    const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/users/login`, 
                        "POST",
                        JSON.stringify({ //provide info for backend
                            email: formState.inputs.email.value, 
                            password:formState.inputs.password.value
                        }),
                        {"Content-Type": "application/json"} //let front end knows it's getting json
                    );
                    
                    auth.login(responseData.userId, responseData.token);
                }catch(err){}

            //else if not login => signup    
                }else{
                try{ //ko dung json cho images dc nen dung form data
                    const formData = new FormData();
                    formData.append("email", formState.inputs.email.value);
                    formData.append("name", formState.inputs.name.value);
                    formData.append("password", formState.inputs.password.value);
                    formData.append("image", formState.inputs.image.value ); //"image" specified in user-routers backend
                    
                    //fetch data from backend
                    const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/users/signup`, 
                    "POST",
                    formData); //formData la body & auto add headers
                  
                    auth.login(responseData.userId, responseData.token);
 
                }catch(err){}
            }
           
        }

        return (
            <React.Fragment>
            <ErrorModal error={error} onClear={clearError}></ErrorModal>
            <Card className="authentication">
                {isLoading && <LoadingSpinner as Overlay /> }
                <h2>Login Required</h2>
                <hr />
                <form onSubmit={authSubmitHandler}>
                    {!isLoginMode && 
                    <Input
                    element="input"
                    id="name"
                    type= "text"
                    label="Your name"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a name."
                    onInput={inputHandler}
                    />}
                    {!isLoginMode && <ImageUpload center id="image" onInput={inputHandler} errorText="Please provide image"/>}
                    <Input 
                        id="email" 
                        element="input" 
                        type="email" 
                        label="E-mail" 
                        validators={[VALIDATOR_EMAIL()]}
                        errorText="Enter a valid email." 
                        onInput={inputHandler}
                    />
                    <Input 
                        id="password" 
                        element="input" 
                        type="password" 
                        label="Password" 
                        validators={[VALIDATOR_MINLENGTH(6)]}
                        errorText="Enter a valid password (At least 6 characters)."
                        onInput={inputHandler}
                    />
                    <Button type="submit" disabled={!formState.isValid}>
                        {isLoginMode ? "LOGIN" : "SIGN UP"}
                    </Button>
                </form>
                    <Button inverse onClick={switchModeHandler}>
                        {!isLoginMode ? "SWITCH TO LOGIN" : "SWITCH TO SIGN UP"}
                    </Button>
            </Card>
            </React.Fragment>
        )
}

    


export default Auth;