import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { toast } from "react-toastify";
import { inkAddress } from "../constants/contract";
import { inkAbi } from "../abi/ink";
import { useDebounce } from "use-debounce";

const TipUser = ({ address, postId }) => {
  let [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState();
  const debouncedAmount = useDebounce(amount, 1000);
  const { isConnected } = useAccount();

  const { config, error: prepareError } = usePrepareContractWrite({
    address: inkAddress,
    abi: inkAbi,
    functionName: "tipOnPost",
    args: [address, parseInt(debouncedAmount[0]), postId],
    enabled: Boolean(debouncedAmount),
  });
  const { data: create, error, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: create?.hash,
  });

  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success("Poster tipped!");
      closeModal();
    }
    error && toast.error(error?.shortMessage);
  }, [isSuccess, error]);

  const handleTip = async (e) => {
    e.preventDefault();
    if (!isConnected) return toast.warning("Please connect");
    if (!amount) return toast.info("Enter an amount");
    write?.();
    isLoading && setAmount("");
    prepareError && toast.error(prepareError?.cause.reason);
    // console.log({ address, postId, amount, debouncedAmount });
  };

  return (
    <Fragment>
      <button
        onClick={openModal}
        className="w-[fit-content] block rounded-md mx-auto bg-neutral-800 px-4 py-2 text font-medium text-white hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        Tip User
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6">
                    Tip User
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Consequuntur, numquam.
                    </p>
                  </div>
                  <form className="mt-4 space-y-4">
                    <div className="flex flex-col">
                      <label className="font-bold">Amount (in SMK)</label>
                      <input
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                        }}
                        type="number"
                        min="0"
                        step={0.01}
                        className="outline-0 py-2 px-1 rounded-lg mt-2 border border-neutral-500"
                      />
                    </div>
                    {/* break */}
                    <button
                      onClick={handleTip}
                      className="cursor-pointer w-full rounded-md bg-neutral-800 p-3 text-sm font-medium text-white hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 text-center"
                      disabled={isLoading}
                    >
                      {isLoading ? "Tipping User..." : "Tip User"}
                    </button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  );
};

export default TipUser;

// Extract toast notifications to a separate custom hook or component for better reusability and separation of concerns. This would avoid duplication of toast logic across components.

// Add loading state handling to disable the submit button when write is loading. This improves UX.

// Use React Context for sharing contract state instead of props drilling. This enhances maintainability as the app grows.

// Memoize selectors like isConnected and isLoading to avoid unnecessary re-renders. This optimizes performance.

// Validate form input (amount) before submitting. This strengthens input validation.
