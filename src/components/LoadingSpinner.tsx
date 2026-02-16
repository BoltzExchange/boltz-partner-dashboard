interface LoadingSpinnerProps {
    message?: string;
    size?: "sm" | "md";
    fullPage?: boolean;
}

export default function LoadingSpinner({
    message,
    size = "md",
    fullPage = true,
}: LoadingSpinnerProps) {
    const sizeClasses = size === "sm" ? "w-5 h-5" : "w-12 h-12";

    const spinner = (
        <div
            className={`${sizeClasses} border-2 border-boltz-primary border-t-transparent rounded-full animate-spin`}
        />
    );

    if (!fullPage) {
        return spinner;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-navy-500">
            <div className="text-center">
                <div className="flex justify-center mb-4">{spinner}</div>
                {message && <p className="text-text-secondary">{message}</p>}
            </div>
        </div>
    );
}
