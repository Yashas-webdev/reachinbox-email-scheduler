import { GoogleLogin } from "@react-oauth/google";

function App() {
  const handleGoogleSuccess = async(credentialResponse: {
    credential?: string;
  }) => {
    try{
      if(!credentialResponse.credential){
        throw new Error("Google ID token was not received");
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            idToken: credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if(!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login successful:",data);

      alert(`Welcom ${data.user.name}`);
    } catch (error){
      console.error("Google login failed",error);

      alert("Google login failed");
    }
  };

  return(
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ReachInbox
        </h1>

        <p className="text-gray-500 mb-8">
          Email Scheduler
        </p>

        <div className="flex justify-center">
          <GoogleLogin
             onSuccess={handleGoogleSuccess}
             onError={() => {
              console.error("Google Login Failed");
              alert("Google Login Failed");
             }}
          />
        </div>
      </div>
    </div>
  )
}

export default App;