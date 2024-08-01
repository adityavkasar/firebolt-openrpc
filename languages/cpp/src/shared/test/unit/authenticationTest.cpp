#include "gtest/gtest.h"
#include "CoreSDKTest.h"
#include "JsonEngine.hpp"


class AuthenticationTest : public ::testing::Test {
	protected:
		JsonEngine* jsonEngine;
		Firebolt::Error error = Firebolt::Error::None;

	void SetUp() override
	{
		jsonEngine = new JsonEngine();
	}

	void TearDown() override
	{
		delete jsonEngine;
	}
};

// TEST_F(AuthenticationTest, TestAuthenticationtoken)
// {
	
// 	auto expectedValues = jsonEngine->get_value("Authentication.token");
// 	expectedValues = expectedValues.substr(1, expectedValues.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().AuthenticationInterface().token(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, expectedValues);
// }


TEST_F(AuthenticationTest, Device)
{
	nlohmann::json_abi_v3_11_3::json expectedValues = nlohmann::json::parse(jsonEngine->get_value("Authentication.device"));

	std::string value = Firebolt::IFireboltAccessor::Instance().AuthenticationInterface().device(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, expectedValues);
}


TEST_F(AuthenticationTest, Session)
{
	nlohmann::json_abi_v3_11_3::json expectedValues = nlohmann::json::parse(jsonEngine->get_value("Authentication.session"));

	std::string value = Firebolt::IFireboltAccessor::Instance().AuthenticationInterface().session(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, expectedValues);
}


TEST_F(AuthenticationTest, Root)
{
	nlohmann::json_abi_v3_11_3::json expectedValues = nlohmann::json::parse(jsonEngine->get_value("Authentication.root"));

	std::string value = Firebolt::IFireboltAccessor::Instance().AuthenticationInterface().root(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, expectedValues);
}