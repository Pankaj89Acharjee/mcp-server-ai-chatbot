import React, { useEffect, useState } from "react";
import useSessionStorage from "../customHooks/useSessionStorage";
import { MdOutlineCancel } from "react-icons/md";
import { Button } from ".";
import { useStateContext } from "../contexts/ContextProvider";
import avatar from "../data/avatar.jpg";
import { message } from "antd";
import Loading from "../components/Loading";
import { FiCreditCard } from "react-icons/fi";
import { BsCurrencyDollar, BsShield } from "react-icons/bs";
import useAuth from "../customHooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getUserSites } from "../apicalls/adminapicalls";
import { useLocationContext } from "../contexts/UserLocationProvider";
import { useQueryClient } from "@tanstack/react-query";

const UserProfile = () => {
  const { userData, setUserData, isFetched, setIsFetched } =
    useLocationContext();
  const [loading, setLoading] = useState(false);
  const [errData, setErrData] = useState(null);

  const { auth, logout } = useAuth(); //Context
  const { getSession } = useSessionStorage();
  const { currentColor } = useStateContext();
  const navigate = useNavigate();
  const userId = auth?.user_id;
  const queryClient = useQueryClient();

  const getUserLocationData = async () => {
    try {
      if (!userId) return;

      setLoading(true);
      const fetch = await getUserSites(userId);

      if (fetch?.data?.length > 0) {
        setUserData({
          location: fetch?.data[0]?.loc_name,
          sitename: fetch?.data[0]?.site_name,
          lineTypeId: fetch?.data[0]?.line_type_name,
        });
      }
    } catch (error) {
      setErrData(error.message);
    } finally {
      setLoading(false);
      setIsFetched(true);
    }
  };

  useEffect(() => {
    if (!isFetched) {
      getUserLocationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const resetUserLocationData = () => {
    setUserData(null);
    setIsFetched(false);
    setErrData(null);
  };

  const handleLogout = () => {
    queryClient.clear();
    resetUserLocationData();
    logout();
    navigate("/login");
  };

  if (loading) {
    return <Loading message="Loading!">Loader</Loading>;
  }

  if (errData) {
    message.error(errData);
  }

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 w-96 rounded-xl">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg dark:text-gray-200">User Profile</p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>

      <div className="flex gap-5 item-center mt-6 border-color border-b-1 pb-6">
        <img src={avatar} className="rounded-full h-24 w-24" alt="profilepic" />
        <div>
          <p className="font-bold text-xl text-pink-600 dark:text-gray-200">
            {getSession?.user_first_name} {getSession?.user_last_name}
          </p>
          <p className="text-gray-500 text-sm font-semibold dark:text-gray-400">
            {" "}
            {getSession?.roleName}{" "}
          </p>
          <p className="text-gray-500 text-sm font-semibold dark:text-gray-400">
            {" "}
            {getSession?.email.toLowerCase()}{" "}
          </p>
        </div>
      </div>
      <div>
        {!userData?.location ? (
          ""
        ) : (
          <div className="flex gap-5 border-b-1 border-color p-4 hover:bg-light-gray cursor-pointer  dark:hover:bg-[#42464D]">
            <button
              type="button"
              style={{ color: "red", backgroundColor: "yellow" }}
              className=" text-xl rounded-lg p-3 hover:bg-light-gray"
            >
              <FiCreditCard />
            </button>

            <div>
              <p className="font-semibold dark:text-gray-200 ">
                {userData?.location}
              </p>
              <p className="text-gray-500 text-sm dark:text-gray-400">
                {" "}
                Location{" "}
              </p>
            </div>
          </div>
        )}

        {!userData?.sitename ? (
          ""
        ) : (
          <div className="flex gap-5 border-b-1 border-color p-4 hover:bg-light-gray cursor-pointer  dark:hover:bg-[#42464D]">
            <button
              type="button"
              style={{ color: "red", backgroundColor: "yellow" }}
              className=" text-xl rounded-lg p-3 hover:bg-light-gray"
            >
              <BsShield />
            </button>

            <div>
              <p className="font-semibold dark:text-gray-200 ">
                {userData?.sitename}
              </p>
              <p className="text-gray-500 text-sm dark:text-gray-400"> Site </p>
            </div>
          </div>
        )}

        {!userData?.lineTypeId ? (
          ""
        ) : (
          <div className="flex gap-5 border-b-1 border-color p-4 hover:bg-light-gray cursor-pointer  dark:hover:bg-[#42464D]">
            <button
              type="button"
              style={{ color: "red", backgroundColor: "yellow" }}
              className=" text-xl rounded-lg p-3 hover:bg-light-gray"
            >
              <BsCurrencyDollar />
            </button>

            <div>
              <p className="font-semibold dark:text-gray-200 ">
                {userData?.lineTypeId}
              </p>
              <p className="text-gray-500 text-sm dark:text-gray-400">
                {" "}
                Line Name{" "}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5">
        <Button
          color="white"
          bgColor={currentColor}
          text="Logout"
          borderRadius="10px"
          width="full"
          customFx={handleLogout}
        />
      </div>
    </div>
  );
};

export default UserProfile;
