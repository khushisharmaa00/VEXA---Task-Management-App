import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils";
import clsx from "clsx";
import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
import {
  useActivateUserProfileMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetTeamListQuery,
  useUpdateProfileMutation,
} from "../redux/slices/apiSlice";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: users = [], refetch } = useGetTeamListQuery();
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activateUserProfile] = useActivateUserProfileMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateProfileMutation();
  const [createUser] = useCreateUserMutation();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/dashboard"); // Redirect non-admins
      toast.error("You don't have admin privileges");
    }
  }, [user, navigate]);

  const userActionHandler = () => {};
  const deleteHandler = async () => {
    try {
      if (selected && selected._id) {
        await deleteUser(selected._id).unwrap();
        await refetch();
        toast.success("User deleted successfully");
        setSelected(null);
        setOpenDialog(false);
      }
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete user");
    }
  };

  const deleteClick = (user) => {
    setSelected(user);
    setOpenDialog(true);
  };

  const handleStatusChange = async (user, e) => {
    try {
      const newStatus = e.target.value === "active";

      console.log("Activating user with ID:", user._id);
      if (!user?._id) {
        toast.error("Invalid user record");
        return;
      }

      const response = await activateUserProfile({
        id: user._id,
        isActive: newStatus,
      }).unwrap();

      await refetch();

      toast.success(
        response.message || `User ${newStatus ? "activated" : "disabled"}`
      );
    } catch (error) {
      toast.error(error.data?.message || "Failed to update status");
    }
  };

  const editClick = (user) => {
    console.log("Editing user:", user);
    setSelected(user);
    setOpen(true);
  };

  const handleAddOrUpdateUser = async (userData) => {
    try {
      if (selected?._id) {
        console.log("Updating user with data:", userData);

        await updateUser({
          targetUserId: selected._id,
          name: userData.name,
          email: userData.email,
          title: userData.title,
          role: userData.role,
          // ...userData,
        }).unwrap();
      } else {
        await createUser({
          name: userData.name,
          email: userData.email,
          title: userData.title,
          role: userData.role,
          password: "Default@123",
          isAdmin: false,
          isActive: true,
        }).unwrap();
      }
      await refetch();
      setOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Error in handleAddOrUpdateUser:", error);
      throw error; //
    }
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300 dark:border-gray-600">
      <tr className="text-black dark:text-gray-300 text-left">
        <th className="py-2 ">Full Name</th>
        <th className="py-2">Title</th>
        <th className="py-2">Email</th>
        <th className="py-2">Role</th>
        <th className="py-2">Status</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <td className="p-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700">
            <span className="text-xs md:text-sm text-center">
              {getInitials(user.name)}
            </span>
          </div>
          {user.name}
        </div>
      </td>

      <td className="p-2">{user.title}</td>
      <td className="p-2">{user.email || "No Email Provided"}</td>
      <td className="p-2">{user.role}</td>

      {/* <td>
        <button
          // onClick={() => userStatusClick(user)}
          onClick={() => handleUserStatusChange(user._id, user.isActive)}
          className={clsx(
            "w-fit px-4 py-1 rounded-full",
            user?.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </button>
      </td> */}
      <td className="p-2">
        <select
          value={user?.isActive ? "active" : "disabled"}
          onChange={(e) => handleStatusChange(user, e)}
          className={clsx(
            "px-3 py-1 rounded-md border border-gray-300 cursor-pointer focus:ring focus:ring-blue-200 focus:outline-none transition-all duration-200",
            user?.isActive
              ? "bg-blue-500 text-white"
              : "bg-yellow-500 text-white"
          )}
        >
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </td>

      <td className="p-2 flex gap-4 justify-end">
        <Button
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-semibold sm:px-0"
          label="Edit"
          type="button"
          onClick={() => editClick(user)}
        />

        <Button
          className="text-red-700 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-semibold sm:px-0"
          label="Delete"
          type="button"
          onClick={() => deleteClick(user)}
        />
      </td>
    </tr>
  );

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="flex items-center justify-between mb-8">
          <Title title="  Team Members" />
          <Button
            label="Add New User"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
          />
        </div>

        <div className="bg-white dark:bg-gray-700 px-2 md:px-4 py-4 shadow-md rounded transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full mb-5">
              <TableHeader />
              <tbody className="bg-white dark:bg-gray-800">
                {/* {summary.users?.map((user, index) => (
                  <TableRow key={index} user={user} />
                ))} */}
                {/* {summary.last10Task?.map((task) =>
                  task.team?.map((user, index) => (
                    <TableRow key={`${task._id}-${index}`} user={user} />
                  ))
                )} */}
                {/* {uniqueUsers.map((user, index) => (
                  <TableRow key={index} user={user} />
                ))} */}
                {users?.map((user) => (
                  <TableRow key={user._id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        // key={new Date().getTime().toString()}
        onSubmit={handleAddOrUpdateUser}
        refetch={refetch}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
    </>
  );
};

export default Users;
