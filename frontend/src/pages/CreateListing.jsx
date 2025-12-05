import React, { useState } from "react";
import {
  getStorage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CreateListing = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    address: "",
    description: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 0,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const generateDescription = async () => {
    try {
      // Validate required fields before making API call
      if (!formData.address || !formData.regularPrice || !formData.bedrooms) {
        setError("Please fill in address, price, and bedrooms first");
        return;
      }

      const body = {
        type: `${formData.bedrooms}BHK`,
        location: formData.address,
        price: formData.regularPrice,
        features: [
          formData.parking && "parking",
          formData.furnished && "furnished",
          formData.offer && "offer",
        ].filter(Boolean),
      };

      const res = await fetch(
        `${base}/ai/generate-description`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (data.description) {
        setFormData((prev) => ({
          ...prev,
          description: data.description,
        }));
        setError(""); // Clear any previous errors
      } else {
        setError("Failed to generate description");
      }
    } catch (err) {
      console.error(err);
      setError("AI generation failed");
    }
  };

  const handleImageSubmit = (e) => {
    e.preventDefault();
    if (files.length > 0) {
      const promises = files.map((file) => storeImage(file));
      setUploading(true);
      Promise.all(promises)
        .then((urls) => {
          setFormData((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.concat(urls),
          }));
          setImageUploadError("");
          setUploading(false);
        })
        .catch((error) => {
          setImageUploadError("Image upload error");
          console.error("Error uploading images:", error);
          setUploading(false);
        });
    }
  };

  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }
    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }
    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");
      
      setLoading(true);
      setError("");
      
      const res = await fetch(`${base}/listing/create/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-5 bg-gray-100 rounded-lg mt-32 shadow-md max-w-5xl mx-auto">
      <h1 className="text-center font-bold text-4xl my-7 text-gray-800">
        Create a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col flex-1 gap-4">
          <input
            className="border rounded-lg p-3 focus:ring-2 focus:ring-red-600"
            type="text"
            placeholder="Property Name"
            id="name"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            className="border rounded-lg p-3 focus:ring-2 focus:ring-red-600"
            placeholder="Description"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <button
            type="button"
            onClick={generateDescription}
            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Generate Description with AI
          </button>

          <div>
            <input
              className="border rounded-lg p-3 focus:ring-2 focus:ring-red-600 w-full"
              type="text"
              placeholder="Address"
              id="address"
              required
              onChange={handleChange}
              value={formData.address}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 text-gray-700">Regular Price</label>
              <input
                className="border rounded-lg p-3 focus:ring-2 focus:ring-red-600"
                type="number"
                placeholder="Regular Price"
                id="regularPrice"
                required
                onChange={handleChange}
                value={formData.regularPrice}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-gray-700">Discount Price</label>
              <input
                className="border rounded-lg p-3 focus:ring-2 focus:ring-red-600"
                type="number"
                placeholder="Discount Price"
                id="discountPrice"
                onChange={handleChange}
                value={formData.discountPrice}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 text-gray-700">Bedrooms</label>
              <input
                className="border rounded-lg p-3 focus:ring-2 focus:ring-red-600"
                type="number"
                id="bedrooms"
                onChange={handleChange}
                value={formData.bedrooms}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-gray-700">Bathrooms</label>
              <input
                className="border rounded-lg p-3 focus:ring-2 focus:ring-red-600"
                type="number"
                id="bathrooms"
                onChange={handleChange}
                value={formData.bathrooms}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 text-gray-700">Type</label>
              <div className="flex gap-2">
                <label>
                  <input
                    type="radio"
                    id="sale"
                    checked={formData.type === "sale"}
                    onChange={handleChange}
                  />{" "}
                  Sale
                </label>
                <label>
                  <input
                    type="radio"
                    id="rent"
                    checked={formData.type === "rent"}
                    onChange={handleChange}
                  />{" "}
                  Rent
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                id="parking"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span className="ml-2">Parking</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                id="furnished"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span className="ml-2">Furnished</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                id="offer"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span className="ml-2">Offer</span>
            </label>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-4">Upload Images</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles([...e.target.files])}
          />
          <button
            type="button"
            className="mt-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
            onClick={handleImageSubmit}
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
          {imageUploadError && (
            <p className="text-red-500 text-sm">{imageUploadError}</p>
          )}
          <div className="flex flex-wrap mt-4">
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="relative w-1/3 p-1">
                <img
                  src={url}
                  alt={`Uploaded ${index}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  onClick={() => handleRemoveImage(index)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="mt-4 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200"
            disabled={loading}
          >
            {loading ? "Creating Listing..." : "Create Listing"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateListing;
