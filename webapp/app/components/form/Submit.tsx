type Props = {
    isLoading: boolean
}

export default function Submit({ isLoading }: Props) {
    return (
        <div className="flex items-center gap-4">
            <input
                type="submit"
                disabled={isLoading}
                className="w-fit rounded-lg bg-primary-600 px-8 py-4 text-white hover:cursor-pointer hover:bg-primary-700 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
                value={"Create"}
            />
            {isLoading && (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-4 border-gray-400 border-t-blue-500" />
            )}
        </div>
    );
}
