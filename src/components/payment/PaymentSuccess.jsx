import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      navigate("/");
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <span className="text-2xl">✅</span>
      </div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">
        Betaling Succesvol!
      </h1>
      <p className="text-gray-600 mb-8">
        Bedankt voor uw boeking. U ontvangt spoedig een bevestigingsmail.
      </p>
      <p className="text-sm text-gray-500">
        U wordt over {countdown} seconden doorgestuurd naar de homepage...
      </p>
    </div>
  );
}
