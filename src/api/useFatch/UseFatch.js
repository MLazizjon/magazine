import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const useFatch = (apiUrl, key) => {
	return useQuery({
		queryKey: [key], // Unique key for caching
		queryFn: async () => {
			const response = await axios.get(`https:// your api adress${apiUrl}`)
			return response.data // Axios automatically parses JSON
		},
	})
}

export default useFatch