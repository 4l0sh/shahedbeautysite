// Function to get price for a package
function getPriceForPackage(packageId) {
  const prices = {
    "oks-bik-ben": "100.00",
    "hele-lichaam": "199.00",
    "oks-bik": "75.00",
  };
  return prices[packageId] || "199.00";
}

// Function to create a payment with Mollie
export const createPayment = async (bookingData) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  try {
    const response = await fetch(`${apiUrl}/api/create-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: getPriceForPackage(bookingData.pkg),
        description: `Laser Treatment - ${bookingData.pkg}`,
        orderId: bookingData.appointmentId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create payment");
    }

    const { checkoutUrl } = await response.json();
    return checkoutUrl;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// Example function to save appointment data
export const saveAppointmentToDatabase = async (bookingData) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  try {
    const response = await fetch(`${apiUrl}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pkg: bookingData.pkg,
        package: bookingData.package || bookingData.pkg,
        date:
          bookingData.date instanceof Date
            ? bookingData.date.toISOString()
            : bookingData.date,
        time: bookingData.time,
        name: bookingData.name,
        customerName: bookingData.customerName || bookingData.name,
        email: bookingData.email,
        customerEmail: bookingData.customerEmail || bookingData.email,
        phone: bookingData.phone,
        customerPhone: bookingData.customerPhone || bookingData.phone,
        notes: bookingData.notes,
        areas: bookingData.areas || [],
        createdAt: new Date().toISOString(),
        status: "confirmed",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save appointment");
    }

    const result = await response.json();
    console.log("Appointment saved successfully:", result);
    return result;
  } catch (error) {
    console.error("Error saving appointment:", error);
    throw error;
  }
};

// Example function to send confirmation email
export const sendConfirmationEmail = async (bookingData) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  try {
    const response = await fetch(`${apiUrl}/api/send-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error;
  }
};
