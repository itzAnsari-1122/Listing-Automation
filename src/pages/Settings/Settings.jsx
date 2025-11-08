// import React, { useEffect, useRef, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useAuth } from "../../context/AuthContext";
// import MainCard from "../../components/Ui/MainCard";
// import ThemeTextField from "../../components/Ui/ThemeTextField";
// import ThemeSelectField from "../../components/Ui/ThemeSelectField";
// import ThemeButton from "../../components/Ui/ThemeButton";
// import { FaCamera } from "react-icons/fa";

// const Settings = () => {
//   const { registerService, user, editProfileService } = useAuth();

//   const [registerProfilePic, setRegisterProfilePic] = useState("");
//   const [editProfilePic, setEditProfilePic] = useState("");

//   const registerFileInputRef = useRef(null);
//   const editFileInputRef = useRef(null);

//   const {
//     control: registerControl,
//     handleSubmit: handleRegisterSubmit,
//     reset: resetRegister,
//     formState: { errors: registerErrors, isSubmitting: registerSubmitting },
//   } = useForm();

//   const {
//     control: editControl,
//     handleSubmit: handleEditSubmit,
//     setValue: setEditValue,
//     formState: { errors: editErrors, isSubmitting: editSubmitting },
//   } = useForm();

//   useEffect(() => {
//     if (user) {
//       setEditValue("username", user.username || "");
//       setEditValue("email", user.email || "");
//       setEditValue("role", user.role || "");
//       if (user.profilePic) setEditProfilePic(user.profilePic);
//     }
//   }, [user, setEditValue]);

//   const handleFileChange = (e, setPic) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => setPic(reader.result);
//   };

//   const onRegisterSubmit = (data) => {
//     const payload = {
//       username: data.username,
//       email: data.email,
//       password: data.password,
//       role: data.role,
//       profilePic: registerProfilePic,
//     };
//     registerService(payload);
//     resetRegister();
//     setRegisterProfilePic("");
//   };

//   const onEditSubmit = (data) => {
//     const payload = {
//       username: data.username,
//       email: data.email,
//       role: data.role,
//       profilePic: editProfilePic,
//     };
//     editProfileService(user._id, payload);
//   };

//   return (
//     <div className="col-span-8 flex items-center justify-center py-10">
//       <div className="w-[90%] xl:w-[80%]">
//         <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
//           <MainCard
//             className="w-full p-8 shadow-[0_12px_30px_var(--color-shadow-heavy)]"
//             bgColor="var(--color-surface)"
//           >
//             <form
//               onSubmit={handleRegisterSubmit(onRegisterSubmit)}
//               className="flex flex-col gap-6"
//             >
//               <h2 className="mb-2 text-center text-3xl font-bold text-blue-600">
//                 Register
//               </h2>

//               <div className="flex justify-center">
//                 <div className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-blue-500">
//                   <img
//                     src={
//                       registerProfilePic ||
//                       "https://cdn-icons-png.flaticon.com/512/847/847969.png"
//                     }
//                     alt="profile"
//                     className="h-full w-full object-cover"
//                   />
//                   <div
//                     className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition group-hover:opacity-100"
//                     onClick={() => registerFileInputRef.current.click()}
//                   >
//                     <FaCamera className="text-2xl text-white" />
//                   </div>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     ref={registerFileInputRef}
//                     className="hidden"
//                     onChange={(e) => handleFileChange(e, setRegisterProfilePic)}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                 <ThemeTextField
//                   label="Name"
//                   name="username"
//                   type="text"
//                   placeholder="Username"
//                   isController
//                   className="w-full"
//                   control={registerControl}
//                   rules={{ required: "Username is required" }}
//                   error={registerErrors?.username?.message}
//                 />

//                 <ThemeTextField
//                   label="Email"
//                   name="email"
//                   type="email"
//                   placeholder="Email"
//                   isController
//                   className="w-full"
//                   control={registerControl}
//                   rules={{ required: "Email is required" }}
//                   error={registerErrors?.email?.message}
//                 />

//                 <ThemeTextField
//                   label="Password"
//                   name="password"
//                   type="password"
//                   placeholder="Password"
//                   isController
//                   className="w-full"
//                   control={registerControl}
//                   rules={{ required: "Password is required" }}
//                   error={registerErrors?.password?.message}
//                 />

//                 <ThemeTextField
//                   label="Confirm Password"
//                   name="confirmPassword"
//                   type="password"
//                   placeholder="Confirm Password"
//                   isController
//                   className="w-full"
//                   control={registerControl}
//                   rules={{ required: "Confirm Password is required" }}
//                   error={registerErrors?.confirmPassword?.message}
//                 />

//                 <div className="md:col-span-2">
//                   <ThemeSelectField
//                     label="Role"
//                     name="role"
//                     isController
//                     control={registerControl}
//                     options={[
//                       { value: "admin", label: "Admin" },
//                       { value: "user", label: "User" },
//                     ]}
//                     rules={{ required: "Role is required" }}
//                   />
//                 </div>
//               </div>

//               <ThemeButton
//                 type="submit"
//                 loading={registerSubmitting}
//                 className="mt-4 w-full"
//               >
//                 Register
//               </ThemeButton>
//             </form>
//           </MainCard>

//           <MainCard
//             className="w-full p-8 shadow-[0_12px_30px_var(--color-shadow-heavy)]"
//             bgColor="var(--color-surface)"
//           >
//             <form
//               onSubmit={handleEditSubmit(onEditSubmit)}
//               className="flex flex-col gap-6"
//             >
//               <h2 className="mb-2 text-center text-3xl font-bold text-blue-600">
//                 Edit Profile
//               </h2>

//               <div className="flex justify-center">
//                 <div className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-blue-500">
//                   <img
//                     src={
//                       editProfilePic ||
//                       "https://cdn-icons-png.flaticon.com/512/847/847969.png"
//                     }
//                     alt="profile"
//                     className="h-full w-full object-cover"
//                   />
//                   <div
//                     className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition group-hover:opacity-100"
//                     onClick={() => editFileInputRef.current.click()}
//                   >
//                     <FaCamera className="text-2xl text-white" />
//                   </div>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     ref={editFileInputRef}
//                     className="hidden"
//                     onChange={(e) => handleFileChange(e, setEditProfilePic)}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//                 <ThemeTextField
//                   label="Name"
//                   name="username"
//                   type="text"
//                   placeholder="Username"
//                   isController
//                   className="w-full"
//                   control={editControl}
//                   rules={{ required: "Username is required" }}
//                   error={editErrors?.username?.message}
//                 />

//                 <ThemeTextField
//                   label="Email"
//                   name="email"
//                   type="email"
//                   placeholder="Email"
//                   isController
//                   className="w-full"
//                   control={editControl}
//                   rules={{ required: "Email is required" }}
//                   error={editErrors?.email?.message}
//                 />

//                 <div className="md:col-span-2">
//                   <ThemeSelectField
//                     label="Role"
//                     name="role"
//                     isController
//                     control={editControl}
//                     options={[
//                       { value: "admin", label: "Admin" },
//                       { value: "user", label: "User" },
//                     ]}
//                     rules={{ required: "Role is required" }}
//                   />
//                 </div>
//               </div>

//               <ThemeButton
//                 type="submit"
//                 loading={editSubmitting}
//                 className="mt-4 w-full"
//               >
//                 Save
//               </ThemeButton>
//             </form>
//           </MainCard>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Settings;
