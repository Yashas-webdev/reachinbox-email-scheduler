import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  avatar: string | null;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      setUser(data.user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("Google ID token was not received");
      }

      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Google login failed");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
      alert("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">ReachInbox</h1>

          <p className="text-gray-500 mb-8">Email Scheduler</p>

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
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">ReachInbox</h1>

          <div className="flex items-center gap-4">
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            )}

            <div>
              <p className="font-medium text-gray-900">{user.name}</p>

              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {user.name}
          </h2>

          <p className="text-gray-500 mt-2">
            Your ReachInbox email scheduler dashboard will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
