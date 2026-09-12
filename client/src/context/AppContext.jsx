import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [activeProjects, setActiveProjects] = useState(null);
    const [loadingActiveProjects, setLoadingActiveProjects] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [generatingProjects, setGeneratingProjects] = useState(false);
    const [activeFile, setActiveFile] = useState("/App.js");
    const [showCode, setShowCode] = useState(false);

    const checkSession = async () => {
        try {
            const { data } = await api.get('/api/auth/me');
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoadingUser(false);
        }
    }

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = async (email,password) => {
        try {
            const {data} = await api.post('/api/auth/login', {email,password});
            setUser(data.user);
            toast.success("Welcome back!");
            navigate('/');
        } catch (err) {
            console.error("Login failed", err);
            const errMsg = err?.response?.data?.error || "Invalid email or password";
            toast.error(errMsg);
            throw new Error(errMsg);
        }
    }

    const register = async (name,email,password) => {
        try {
            const {data} = await api.post('/api/auth/register', {name,email,password});
            setUser(data.user);
            toast.success("Account created successfully!");
            navigate('/');
        } catch (err) {
            console.error("Registration failed", err);
            const errMsg = err?.response?.data?.error || "Registration failed";
            toast.error(errMsg);
            throw new Error(errMsg);
        }
    }

    const logout = async () => { 
        try {
            await api.post('/api/auth/logout');
            setUser(null);
            setProjects([]);
            setActiveProjects(null);
            toast.success("Logged out successfully!");
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
            toast.error("Logout failed. Please try again.");
        }
    }

    const loadProjects = async () => { 
        if (!user) return;
        try {
            const {data} = await api.get('/api/projects');
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
            toast.error("Failed to load projects. Please try again.");
        } finally {
            setLoadingProjects(false);
        }
    }

    const loadProject = async (id, silent = false) => { 
        if (!user) return;
        if (!silent) setLoadingActiveProjects(true);
        try {
            const {data} = await api.get(`/api/projects/${id}`);
            setActiveProjects(data);

            const files = Object.keys(data.files);
            if (files.length > 0) {
                setActiveFile((prev) => {
                    if (files.includes(prev)) return prev;
                    if(files.includes("/App.js")) return "/App.js";
                    return files[0];
                });
            }
        } catch (error) {
            console.error("Failed to load project", error);
            if (!silent){
                toast.error("Failed to load project. Please try again.");
                navigate('/');
            }
        } finally {
            if (!silent) setLoadingActiveProjects(false);
        }
    }

    useEffect(() => {
        if (!activeProjects?._id || !user) return;
        const isOnGoing = activeProjects?.status === "generating" || activeProjects?.status === "pending" || activeProjects?.status === "revising";
        if (isOnGoing) { 
            setChatLoading(true);
            const interval = setInterval(() => {
                loadProject(activeProjects._id, true);
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setChatLoading(false);
        }
    }, [activeProjects?._id, activeProjects?.status, loadProject, user]);

    const handleGenerate = useCallback(
        async (prompt) => {
            if (!user) return;
            setGeneratingProjects(true);
            try {
                const { data } = await api.post('/api/projects', { prompt });
                toast.success("AI Agent is planning structure...");
                navigate(`/builder/${data._id}`);
            } catch (error) {
                console.error("Failed to generate project", error);
                toast.error("Failed to generate project. Please try again.");
            } finally {
                setGeneratingProjects(false);
            }
        },[navigate, user]
    )

    const handleDelete = useCallback(
        async (id) => {
            if (!user) return;
            try {
                const { data } = await api.delete(`/api/projects/${id}`);
                setProjects((prev) => prev.filter((project) => project._id !== id));
                toast.success("Project deleted successfully!");
            } catch (error) {
                console.error("Failed to delete project", error);
                toast.error("Failed to delete project. Please try again.");
            }
        },[user]
    )

    return (
        <AppContext.Provider value={{
            user,
            loadingUser,
            login,
            register,
            projects,
            loadingProjects,
            activeProjects,
            loadingActiveProjects,
            chatLoading,
            generatingProjects,
            activeFile,
            showCode,
            setActiveFile,
            setShowCode,
            loadProjects,
            loadProject,
            handleGenerate,
            handleDelete,
            
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    return context;
}