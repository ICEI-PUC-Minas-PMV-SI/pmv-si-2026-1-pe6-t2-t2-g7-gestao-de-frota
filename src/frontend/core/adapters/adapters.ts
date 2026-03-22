import { AxiosAdapter } from "./http/Axios.adapter";
import { HttpAdapter } from "./http/interface";

interface IProps {
  http: HttpAdapter;
}

export const adapters: IProps = {
  http: new AxiosAdapter(),
};

