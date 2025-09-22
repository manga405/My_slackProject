import Axios from "../libs/api";
import { useQuery } from "../context/QueryProvider";

const token = localStorage.getItem('token')

const useAuth = () => {
    const { data } = useQuery({
        queryKey: 'auth',
        queryFn: () => {
            return Axios({
                url: `${process.env.REACT_APP_BASE_URL}/auth/check?token=${token}`,
                method: 'GET',
            });
        }
    });

    return {
        auth: data || {},
    }
}

export default useAuth;
