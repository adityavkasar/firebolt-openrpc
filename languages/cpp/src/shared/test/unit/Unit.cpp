#include "gtest/gtest.h"
#include "CoreSDKTest.h"

int main(int argc, char** argv) {
    std::cout << ">>> Inside Unit Test Main" << std::endl;
    std::string url = "ws://localhost:9998";
    CoreSDKTest::CreateFireboltInstance(url);
    if (CoreSDKTest::WaitOnConnectionReady() == true) {
        ::testing::InitGoogleTest(&argc, argv);
        return RUN_ALL_TESTS();
    }
}