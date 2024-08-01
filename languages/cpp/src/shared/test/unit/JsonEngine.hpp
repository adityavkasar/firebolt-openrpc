#include <fstream>
#include <nlohmann/json.hpp>

#define REMOVE_QUOTES(s) (s.substr(1, s.length() - 2))
#define STRING_TO_BOOL(s) (s == "true" ? true : false)

class JsonEngine
{
    private:
        std::fstream _file;
        nlohmann::json _data;

    public:

        JsonEngine()
        {
            _file.open("/home/aditya-v/work/firebolt-cert/Firebolt/firebolt-core-native-sdk-3.0.0-next.3/src/Transport/firebolt-core-open-rpc.json");
            
            if (_file.is_open())
                _file >> _data;
        }

        ~JsonEngine(){
            if (_file.is_open())
                _file.close();
        }

        std::string get_value(const std::string& method_name)
        {
            for (const auto &method : _data["methods"])
                {
                    if (method.contains("name") && (method["name"] == method_name))
                    {
                        auto value = method["examples"][0]["result"]["value"];
                        // std::cout << "ADITYA method_name: " << typeid(value).name() << std::endl;
                        // if(typeid(method["examples"][0]["result"]["value"]).name() == typeid(std::string).name() ){
                        //     std::cout << "ADITYA: its a string" << std::endl; 
                        //     return (method["examples"][0]["result"]["value"]);
                        // }else{
                            // std::cout << "ADITYA value: " << value << std::endl;
                            return value.dump();
                        // }
                    }
                }
            return "";
        }


        void make_test(const std::string& module, const std::string& unit)
        {
            std::ofstream file;
            file.open("dummyTest.cpp", std::ios::app);

            if (!file) {
                // std::cout << "Unable to open file";
                exit(1); // Call system to stop if unable to open the file
            }

            file << std::endl << std::endl;
            file << "TEST_F(" << module << "Test, Test" << module << unit << ")" << std::endl;
            file << "{" << std::endl;
            file << "\tFirebolt::Error error = Firebolt::Error::None;" << std::endl;
            file << "\tauto actual_value = jsonEngine->get_value(\"" << module << "." << unit << "\");" << std::endl;
            file << "\tactual_value = actual_value.substr(1, actual_value.length() - 2);" << std::endl;
            file << "\tauto value = Firebolt::IFireboltAccessor::Instance()." << module << "Interface()." << unit << "(&error);" << std::endl;
            file << "\tEXPECT_EQ(error, Firebolt::Error::None);" << std::endl;
            file << "\tEXPECT_EQ(value, actual_value);" << std::endl;
            file << "}" << std::endl;

            file.close();
        }

        void prase_json()
        {
            for (const auto &method : _data["methods"])
            {
                    std::string method_name = method["name"];
                    size_t pos = method_name.find('.');
                    std::string module = method_name.substr(0, pos);
                    std::string unit = method_name.substr(pos + 1);

                    auto value = method["examples"][0]["result"]["value"].dump();
                    auto value_json = nlohmann::json::parse(value);

                    // std::cout << "ADITYA: " << value_json << std::endl;
                    // std::cout << "ADITYA: " << value_json.is_boolean() << std::endl;

                    // if(value_json.is_boolean()){
                        make_test(module, unit);
                    // }
            }

        }
};