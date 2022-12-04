import {useState, useCallback, useEffect} from "react";

let logoutTimer; 

export const useAuth = () => {
    const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false)


  const login = useCallback((uid, token, expirationDate)=> {
    setToken(token);
    setUserId(uid);
    //generate time = now + 1h
    const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000*60*60);
    
    setTokenExpirationDate(tokenExpirationDate);
    //strogin objects inside localStorage as JSON
    localStorage.setItem(
      "userData", 
      JSON.stringify({
        userId: uid, 
        token: token, 
        expiration: tokenExpirationDate.toISOString()}));
  }, []);

  const logout = useCallback((uid)=>{
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    localStorage.removeItem("userData");
  },[]);

  useEffect(()=> {
    if(token && tokenExpirationDate){
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime)
    } else{
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate])

  //after React renders all the components
  //call back de auto login
  useEffect(() => {
    //chuyen data tu dang JSON ve lai JS objects
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if(storedData && storedData.token && new Date(storedData.expiration) > new Date()){
      login(storedData.userId, storedData.token, new Date(storedData.expiration)); //login with userId and token
    }
  }, [login])

  return {token, login, logout, userId};
}