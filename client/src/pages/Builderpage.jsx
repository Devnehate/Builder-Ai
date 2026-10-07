import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import BuilderHeader from '../components/BuilderHeader';
import { FolderTree, MessageSquareIcon } from 'lucide-react';
import Chatpanel from '../components/Chatpanel';
import Fileexplorer from '../components/Fileexplorer';
import PreviewPanel from '../components/PreviewPanel';
import AgentProgressDashboard from '../components/AgentProgressDashboard';
import PublishModel from '../components/PublishModel';
import api from '../api/api';
import toast from 'react-hot-toast';
import { exportProjectZip } from '../utils/exportProject';

const Builderpage = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [leftTab, setLeftTab] = useState('chat');
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState(null);
  
  const {activeProjects, loadingActiveProjects, activeFile, showCode, setActiveFile, setShowCode, loadProject, logout, chatLoading, handleChat} = useAppContext();

  useEffect(() => { 
    if (!id) return;
    loadProject(id);
  }, [id]);
  
  useEffect(() => { 
    if (!id || !activeProjects) return;
    if (activeProjects.status === 'pending' || activeProjects.status === 'generating') {
      const interval = setInterval(() => {
        loadProject(id, true);
      }, 1500);
      return () => clearInterval(interval);
    }
  },[id, loadProject, activeProjects]);

  const handleOpenPreview = () => {
    if (!id) return;
    window.open(`/preview/${id}`, '_blank');
  }

  const handlePublish = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await api.post(`/api/projects/${id}/publish`);
      const url = `${window.location.origin}/publish/${id}`;
      setPublishUrl(url);
      toast.success("Website published successfully!");
    } catch (error) {
      console.error("Publish failed:",error);
      toast.error(error?.response?.data?.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  const handleDownload = () => {
    if (!activeProjects) return;
    exportProjectZip(activeProjects);
  }

  if (loadingActiveProjects || !activeProjects) {
    return <Loading />
  }


  return (
    <div className='h-screen flex flex-col bg-white overflow-hidden text-zinc-900 relative'>
      <BuilderHeader
        projectName={activeProjects.name}
        version={activeProjects.version}
        showCode={showCode}
        publishing={publishing}
        onToggleShowCode={() => setShowCode(!showCode)}
        onOpenPreview={handleOpenPreview}
        onPublish={handlePublish}
        onDownload={handleDownload}
        onBack={() => navigate('/')}
        onLogout={logout}
      />

      <div className='flex-1 flex overflow-hidden'>
        <div className='w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white'>
          <div className='flex border-b border-zinc-100'>
            <button onClick={()=> setLeftTab("chat")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${leftTab === "chat" ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-400 hover:text-zinc-700"}`}>
              <MessageSquareIcon size={13} /> Chat
            </button>

            <button onClick={()=> setLeftTab("files")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${leftTab === "files" ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-400 hover:text-zinc-700"}`}>
              <FolderTree size={13} /> Files
            </button>
          </div>

          <div className='flex-1 overflow-hidden'>
            {
              leftTab === "chat" ? (
                <Chatpanel messages={activeProjects.messages} onSend={handleChat} loading={chatLoading} />
              ) : (
                  <Fileexplorer files={activeProjects.files} activeFile={activeFile} onFileSelect={(path) => {
                    setActiveFile(path); setShowCode(true);
                }} />
              )
            }
          </div>
        </div>
          <div className='flex-1 overflow-hidden'>
            {activeProjects.status === 'pending' || activeProjects.status === 'generating' || activeProjects.status === 'failed' ? (
            <AgentProgressDashboard project={activeProjects} />
            ) : (
              <PreviewPanel project={activeProjects} activeFile={activeFile} showCode={showCode} />
              )}
          </div>
      </div>
      {
        publishUrl && <PublishModel publishUrl={publishUrl} onClose={() => setPublishUrl(null)} />
      }
    </div>
  )
}

export default Builderpage