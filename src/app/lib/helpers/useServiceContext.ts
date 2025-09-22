import { ServiceContext } from "../../providers/ServiceContextProvider";
import { useContext } from "react";

export default function useServiceContext() {
  const context = useContext(ServiceContext);
  return context;
}
