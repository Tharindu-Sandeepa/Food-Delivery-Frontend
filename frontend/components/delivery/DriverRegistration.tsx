import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL_DELIVERIES } from "@/lib/constants/Base_url";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DriverForm = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    vehicleType: "",
    available: true,
  });

  useEffect(() => {
    const checkDriverRegistration = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("No user ID found in localStorage");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${BASE_URL_DELIVERIES}/api/drivers/${userId}`
        );
        if (response.data) {
          setIsRegistered(true);
          setFormData({
            name: response.data.name,
            contactNumber: response.data.contactNumber,
            vehicleType: response.data.vehicleType,
            available: response.data.available,
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Type-safe handling of Axios errors
          if (error.response?.status === 404) {
            setIsRegistered(false);
          } else {
            console.error("Error checking driver registration:", error.message);
          }
        } else {
          // Handle non-Axios errors
          console.error("Unexpected error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkDriverRegistration();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("No user ID found. Please login first.");
        return;
      }

      const payload = {
        userId,
        ...formData,
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
      };

      if (isRegistered) {
        await axios.put(
          `${BASE_URL_DELIVERIES}/api/drivers/${userId}`,
          payload
        );
        toast.success("Driver information updated successfully!");
      } else {
        await axios.post(`${BASE_URL_DELIVERIES}/api/drivers`, payload);
        toast.success("Driver registered successfully!");
        setIsRegistered(true);
        //refresh the brouser to show the new driver information

        location.reload();
      }
    } catch (error) {
      console.error("Error saving driver information:", error);
      alert("Failed to save driver information. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 dashboard-card">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isRegistered ? "Edit Driver Profile" : "Driver Registration"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="contactNumber"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Contact Number
          </label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="vehicleType"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select Vehicle Type</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="car">Car</option>
            <option value="truck">Truck</option>
            <option value="bicycle">Bicycle</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="available"
            name="available"
            checked={formData.available}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border rounded"
          />
          <label
            htmlFor="available"
            className="ml-2 block text-sm text-muted-foreground"
          >
            Available for deliveries
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isRegistered ? "Update Profile" : "Register as Driver"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverForm;
