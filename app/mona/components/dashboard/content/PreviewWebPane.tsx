import { Icon } from "@iconify/react";
import { useCallback, useMemo, useRef, useState } from "react";

function normalizeUrl(input: string): string {
    const value = input.trim();
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }
    return `https://${value}`;
}

function NavButton({
    icon,
    tooltip,
    onClick,
    disabled,
}: {
    icon: string;
    tooltip: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            title={tooltip}
            disabled={disabled}
            onClick={onClick}
            className="flex items-center justify-center rounded-[8px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ width: 28, height: 28, color: "#717182" }}
        >
            <Icon icon={icon} width={14} height={14} />
        </button>
    );
}

export function PreviewWebPane({ url }: { url: string }) {
    const initialUrl = useMemo(() => normalizeUrl(url), [url]);
    const [currentUrl, setCurrentUrl] = useState(initialUrl);
    const [inputUrl, setInputUrl] = useState(initialUrl);
    const [reloadTick, setReloadTick] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const canShowFrame = currentUrl.length > 0;

    const handleNavigate = useCallback((nextUrl: string) => {
        const normalized = normalizeUrl(nextUrl);
        setInputUrl(normalized);
        setCurrentUrl(normalized);
    }, []);

    const handleSubmitUrl = useCallback(() => {
        handleNavigate(inputUrl);
    }, [handleNavigate, inputUrl]);

    const handleGoBack = useCallback(() => {
        try {
            iframeRef.current?.contentWindow?.history.back();
        } catch {
            // Ignore cross-origin history errors.
        }
    }, []);

    const handleGoForward = useCallback(() => {
        try {
            iframeRef.current?.contentWindow?.history.forward();
        } catch {
            // Ignore cross-origin history errors.
        }
    }, []);

    const handleReload = useCallback(() => {
        setReloadTick((v) => v + 1);
    }, []);

    const handleSelect = useCallback(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleOpenInNewTab = useCallback(() => {
        if (!currentUrl) return;
        window.open(currentUrl, "_blank", "noopener,noreferrer");
    }, [currentUrl]);

    const frame = canShowFrame ? (
        <iframe
            key={`${currentUrl}:${reloadTick}`}
            ref={iframeRef}
            src={currentUrl}
            title="Project preview"
            className="w-full flex-1 border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
    ) : (
        <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
                <p
                    className="text-[14px] text-[#717182]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                >
                    Your generated app will appear here
                </p>
            </div>
        </div>
    );

    return (
        <div
            className={isFullscreen
                ? "fixed inset-4 z-50 flex flex-col rounded-[12px] overflow-hidden"
                : "flex flex-col h-full rounded-[12px] overflow-hidden"
            }
            style={{
                border: "1px solid rgba(0,0,0,0.08)",
                background: "white",
                boxShadow: isFullscreen ? "0 24px 72px rgba(0,0,0,0.24)" : "none",
            }}
        >
            <div
                className="flex items-center gap-1 px-2 shrink-0"
                style={{
                    height: 40,
                    background: "#f8f8fb",
                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                }}
            >
                <NavButton
                    icon="lucide:arrow-left"
                    tooltip="Go back"
                    onClick={handleGoBack}
                    disabled={!canShowFrame}
                />
                <NavButton
                    icon="lucide:arrow-right"
                    tooltip="Go forward"
                    onClick={handleGoForward}
                    disabled={!canShowFrame}
                />
                <NavButton
                    icon="lucide:refresh-ccw"
                    tooltip="Reload"
                    onClick={handleReload}
                    disabled={!canShowFrame}
                />
                <div
                    className="flex items-center gap-2 px-2 rounded-[8px] flex-1"
                    style={{
                        background: "white",
                        border: "1px solid rgba(0,0,0,0.1)",
                        height: 30,
                    }}
                >
                    <Icon icon="lucide:globe" width={12} height={12} color="#717182" />
                    <input
                        ref={inputRef}
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.currentTarget.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSubmitUrl();
                            }
                        }}
                        placeholder="Enter preview URL"
                        className="w-full bg-transparent text-[12px] text-[#3f3f46] outline-none"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    />
                </div>
                <NavButton
                    icon="lucide:mouse-pointer-click"
                    tooltip="Select URL"
                    onClick={handleSelect}
                />
                <NavButton
                    icon="lucide:external-link"
                    tooltip="Open in new tab"
                    onClick={handleOpenInNewTab}
                    disabled={!canShowFrame}
                />
                <NavButton
                    icon={isFullscreen ? "lucide:minimize-2" : "lucide:maximize-2"}
                    tooltip={isFullscreen ? "Exit fullscreen" : "Maximize"}
                    onClick={() => setIsFullscreen((prev) => !prev)}
                />
            </div>
            {frame}
        </div>
    );
}
