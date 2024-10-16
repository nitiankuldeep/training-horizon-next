"use client";
import React, { useState } from 'react';
import Navbar from '@/components/UserFlow/NavBar';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
const axios = require('axios');
import Popup from '@/components/trainer-dashboard/PopUp';

// Zod schema for form validation
const registerMemberSchema = z.object({x
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z
    .number()
    .int({ message: 'Age must be a valid integer' })
    .min(0, 'Age must be greater than 0'),
  dob: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  relationship: z.enum(['brother', 'child', 'father', 'mother'], 'Select a valid relationship'),
  gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'Select a valid gender' }) }),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
  agreeToTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms and conditions' }) }),
  doctorName: z.string().optional(),
  doctorNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
});

const RegisterMemberForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(registerMemberSchema),
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popUpMessage, setpopUpMessage] = useState("");

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post('http://localhost:3005/api/v1/user/registerMember', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log(response.data);
      setpopUpMessage("Member registered successfully");
      setShowPopup(true);
      reset();
    } catch (error) {
      setpopUpMessage("Error registering member");
      setShowPopup(true);
      console.error('Error registering member:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 mt-10 ">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Register Family Member</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register("name")}
              className={`mt-1 block w-full px-4 py-2   shadow-sm border ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter member's name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              {...register("age", { valueAsNumber: true })}
              className={`mt-1 block w-full px-4 py-2   shadow-sm border ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter age"
            />
            {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              {...register("dob")}
              className={`mt-1 block w-full px-4 py-2   shadow-sm border ${errors.dob ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.dob && <p className="text-red-500 text-sm">{errors.dob.message}</p>}
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Relationship</label>
            <select
              {...register("relationship")}
              className={`mt-1 block w-full px-4 py-2   shadow-sm border ${errors.relationship ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select relationship</option>
              <option value="brother">Brother</option>
              <option value="child">Child</option>
              <option value="father">Father</option>
              <option value="mother">Mother</option>
            </select>
            {errors.relationship && <p className="text-red-500 text-sm">{errors.relationship.message}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              {...register("gender")}
              className={`mt-1 block w-full px-4 py-2   shadow-sm border ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              {...register("address")}
              className={`mt-1 block w-full px-4 py-2   shadow-sm border ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter address"
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              {...register("city")}
              className={`mt-1 block w-full px-4 py-2   shadow-sm border ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter city"
            />
            {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
            <input
              {...register("postalCode")}
              className={`mt-1 block w-full px-4 py-2   shadow-sm border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter postal code"
            />
            {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode.message}</p>}
          </div>


          {/* Doctor's Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor's Name (Optional)</label>
            <input
              {...register("doctorName")}
              className="mt-1 block w-full px-4 py-2   shadow-sm border border-gray-300"
              placeholder="Enter doctor's name"
            />
          </div>

          {/* Doctor's Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor's Number (Optional)</label>
            <input
              type="tel"
              {...register("doctorNumber")}
              className="mt-1 block w-full px-4 py-2   shadow-sm border border-gray-300"
              placeholder="Enter doctor's number"
            />
          </div>
          {/* Agree to Terms */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("agreeToTerms")}
                className="mr-2"
              />
              I agree to the terms and conditions
            </label>
            {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4  hover:bg-blue-600 transition duration-150"
          >
            Submit
          </button>

          {/* Popup for messages */}
          <Popup
            message={popUpMessage}
            isOpen={showPopup}
            onClose={() => setShowPopup(false)}
            redirectTo="/"
          />
        </form>
      </div>
    </div>
  );
};

export default RegisterMemberForm;