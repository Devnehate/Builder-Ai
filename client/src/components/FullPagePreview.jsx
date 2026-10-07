import React, { useMemo, useState } from 'react';
import { detectDependencies } from '../utils/sandpackUtils';
import SandpackErrorMonitor from './SandpackErrorMonitor';

import {
    SandpackLayout,
    SandpackPreview,
    SandpackProvider,
} from '@codesandbox/sandpack-react';

const FullPagePreview = ({ files }) => {
    const [showErrorOverlay, setShowErrorOverlay] = useState(true);

    const sandpackFiles = useMemo(() => {
        if (!files || typeof files !== 'object') {
            return {};
        }

        const sandpackFiles = {};

        for (const [path, content] of Object.entries(files)) {
            const filePath = path.startsWith('/')
                ? path
                : `/${path}`;

            sandpackFiles[filePath] = {
                code:
                    typeof content === 'string'
                        ? content
                        : content?.code || '',
            };
        }

        console.log('Sandpack Files:', sandpackFiles);

        return sandpackFiles;
    }, [files]);

    const dependencies = useMemo(() => {
        if (!files || typeof files !== 'object') {
            return {};
        }

        const detected = detectDependencies(files);

        console.log('Detected Dependencies:', detected);

        return detected || {};
    }, [files]);

    if (!files) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <p className="text-zinc-500">
                    No project files found.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-screen overflow-hidden">
            <SandpackProvider
                template="react"
                files={sandpackFiles}
                customSetup={{
                    dependencies,
                }}
                options={{
                    externalResources: [
                        'https://cdn.tailwindcss.com',
                        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
                    ],
                    logLevel: 0,
                }}
            >
                <SandpackErrorMonitor
                    onErrorChange={setShowErrorOverlay}
                />

                <SandpackLayout className="h-full w-full border-none bg-transparent">
                    <SandpackPreview
                        showNavigator={false}
                        showRefreshButton={false}
                        showOpenInCodeSandbox={false}
                        showSandpackErrorOverlay={showErrorOverlay}
                        className="h-full w-full"
                    />
                </SandpackLayout>
            </SandpackProvider>
        </div>
    );
};

export default FullPagePreview;