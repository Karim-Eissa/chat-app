    import { useState } from "react";
    import { useParams ,useNavigate} from "react-router-dom";
    import { useAuthStore } from "../store/useAuthStore";
    import AuthImagePattern from "../components/AuthImagePattern";
    import { Eye, EyeOff, Loader2, Lock, MessageSquare } from "lucide-react";

    const ResetPasswordPage = () => {
    const { token } = useParams(); 
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({ password: "", confirmPassword: "" });

    const { resetPassword, isChangingPass } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await resetPassword({ token, ...formData });
        if (success) {
            navigate("/login");
        }
    };

    return (
        <div className="h-screen grid lg:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
            <div className="w-full max-w-md space-y-8">
            <div className="text-center mb-8">
                <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Set a new password</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-base-content/40" />
                    </div>
                    <input
                    type={showPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5 text-base-content/40" />
                    ) : (
                        <Eye className="h-5 w-5 text-base-content/40" />
                    )}
                    </button>
                </div>
                
                </div>

                <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Confirm Password</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-base-content/40" />
                    </div>
                    <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10`}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                    {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-base-content/40" />
                    ) : (
                        <Eye className="h-5 w-5 text-base-content/40" />
                    )}
                    </button>
                </div>
                
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={isChangingPass}>
                {isChangingPass ? (
                    <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Changing...
                    </>
                ) : (
                    "Change Password"
                )}
                </button>
            </form>
            </div>
        </div>

        <AuthImagePattern
            title={"Set your new password"}
            subtitle={"Sign in to continue your conversations and catch up with your messages."}
        />
        </div>
    );
    };

    export default ResetPasswordPage;
