// import React from "react";
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const usePost = apiPost => {
	return useMutation({
		mutationFn: async obj => {
			try {
				const response = await axios.post(`https://your api adress/${apiPost}`, obj)
				return response.data // Axios automatically parses JSON
			} catch (error) {
				throw new Error('Something went wrong!')
			}
		},
	})
}

export default usePost