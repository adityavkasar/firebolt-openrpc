#include <iostream>
#include <fstream>
#include <nlohmann/json.hpp>
#include <string>
#include <typeinfo>
#include <cctype>

using nlohmann::json;


inline std::string capitalizeFirstChar(std::string str) {
    if (!str.empty()) {
        str[0] = std::toupper(str[0]);
    }
    return str;
}

class JsonEngine
{
public:
    template <typename RESPONSE>
    static Firebolt::Error MockRequest(WPEFramework::Core::JSONRPC::Message &message, RESPONSE &response)
    {
        // Open the JSON file. TODO: Use relative path here
        std::ifstream file("/home/aditya-v/work/firebolt-cert/Firebolt/firebolt-core-native-sdk-3.0.0-next.3/src/Transport/firebolt-core-open-rpc.json");
        json data;
        if (file.is_open()) {
            file >> data;
            std::string methodName = capitalizeFirstChar(message.Designator.Value().c_str());

            // Loop through the methods to find the one with the given name
            for (const auto &method : data["methods"])
            {
                if (method.contains("name") && (method["name"] == methodName))
                {
                    if(typeid(method["examples"][0]["result"]["value"]).name() == typeid(std::string).name() ){
                        message.Result = method["examples"][0]["result"]["value"];
                    }else{
                        message.Result = method["examples"][0]["result"]["value"].dump();
                    }
                }
            }

            file.close();
        }

        return Firebolt::Error::None;
    }
};