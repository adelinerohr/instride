import Client, { Local } from "./client"

export const serverBaseURL = Local

export const serverClient = new Client(serverBaseURL, {
	requestInit: {
		credentials: "include",
	},
})

export default serverClient
