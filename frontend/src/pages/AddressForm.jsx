import { useState, useEffect } from "react";
import {
  Home,
  Phone,
  MapPin,
  Building,
  Landmark,
  Map,
  Mailbox,
} from "lucide-react";
import { useAddressStore } from "../stores/useAddressStore";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";

const AddressForm = ({ existingAddress, closeModal }) => {
  const { addAddress, updateAddress } = useAddressStore();
  const { user } = useUserStore();

  const [addressData, setAddressData] = useState({
    houseName: "",
    street: "",
    optional: "",
    city: "",
    state: "",
    zipcode: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (existingAddress) {
      setAddressData({
        houseName: existingAddress.houseName || "",
        street: existingAddress.streetAddress || "",
        optional: existingAddress.optionalAddress || "",
        city: existingAddress.city || "",
        state: existingAddress.state || "",
        zipcode: existingAddress.zipCode || "",
        phoneNumber: existingAddress.phoneNumber || "",
      });
    }
  }, [existingAddress]);

  const handleChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      user: user._id,
      houseName: addressData.houseName,
      streetAddress: addressData.street,
      optionalAddress: addressData.optional,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipcode,
      phoneNumber: addressData.phoneNumber,
    };

    if (existingAddress) {
      await updateAddress(existingAddress._id, formattedData);
      toast.success("Address updated successfully!");
    } else {
      await addAddress(formattedData);
      toast.success("Address added successfully!");
    }

    setAddressData({
      houseName: "",
      street: "",
      optional: "",
      city: "",
      state: "",
      zipcode: "",
      phoneNumber: "",
    });

    closeModal();
  };

  // ✅ Full List of Indian States & Union Territories
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",

    // ✅ Union Territories
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
    "Delhi",
    "Puducherry",
    "Jammu and Kashmir",
    "Ladakh",
  ];

  return (
    <div
      className={`flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
        !existingAddress ? "lg:mt-10" : "mt-0"
      }`}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold">
          {existingAddress ? "Update Address" : "Add Address"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-transparent border border-[#A31621] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="houseName" className="block text-sm font-medium">
                House Name
              </label>
              <div className="relative flex items-center">
                <Home className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="houseName"
                  type="text"
                  name="houseName"
                  required
                  value={addressData.houseName}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pl-10 bg-transparent rounded-md shadow-sm"
                  placeholder="Enter house name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="street" className="block text-sm font-medium">
                Street Address
              </label>
              <div className="relative flex items-center">
                <Map className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="street"
                  type="text"
                  name="street"
                  required
                  value={addressData.street}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pl-10 bg-transparent rounded-md shadow-sm"
                  placeholder="Enter street address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium">
                City
              </label>
              <div className="relative flex items-center">
                <Building className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="city"
                  type="text"
                  name="city"
                  required
                  value={addressData.city}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pl-10 bg-transparent rounded-md shadow-sm"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium">
                State
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3 h-5 w-5 text-gray-400" />
                <select
                  id="state"
                  name="state"
                  required
                  value={addressData.state}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pl-10 bg-transparent rounded-md shadow-sm relative z-10"
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="zipcode" className="block text-sm font-medium">
                Zipcode
              </label>
              <div className="relative flex items-center">
                <Mailbox className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="zipcode"
                  type="text"
                  name="zipcode"
                  required
                  value={addressData.zipcode}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pl-10 bg-transparent rounded-md shadow-sm"
                  placeholder="Enter zipcode"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium"
              >
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  required
                  value={addressData.phoneNumber}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pl-10 bg-transparent rounded-md shadow-sm"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm bg-[#A31621] text-white hover:bg-[#800F17] transition"
            >
              {existingAddress ? "Update Address" : "Save Address"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
