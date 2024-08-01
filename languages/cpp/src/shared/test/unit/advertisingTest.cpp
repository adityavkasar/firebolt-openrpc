#include "gtest/gtest.h"
#include "CoreSDKTest.h"
#include "JsonEngine.hpp"
#include "advertising.h"


class AdvertisingTest : public ::testing::Test {
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

	std::string skipRestrictionToString(Firebolt::Advertising::SkipRestriction skipRestriction) 
	{
		std::string str = "";
		switch(skipRestriction) 
		{
			case Firebolt::Advertising::SkipRestriction::NONE: str = "none"; break;
			case Firebolt::Advertising::SkipRestriction::ADS_UNWATCHED: str = "adsUnwatched"; break;
			case Firebolt::Advertising::SkipRestriction::ADS_ALL: str = "adsAll"; break;
			case Firebolt::Advertising::SkipRestriction::ALL: str = "all"; break;
			default: str = "unknown";
		}
    	return str;
	}

};


TEST_F(AdvertisingTest, Config)
{
	std::string expectedValues = jsonEngine->get_value("Advertising.config");

	Firebolt::Advertising::AdConfigurationOptions options;
	std::string adFrameworkConfig = Firebolt::IFireboltAccessor::Instance().AdvertisingInterface().config(options, &error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ((nlohmann::json::parse(adFrameworkConfig)).dump(), expectedValues);
}


TEST_F(AdvertisingTest, Policy)
{
	nlohmann::json_abi_v3_11_3::json expectedValues = nlohmann::json::parse(jsonEngine->get_value("Advertising.policy"));

	Firebolt::Advertising::AdPolicy adPolicy = Firebolt::IFireboltAccessor::Instance().AdvertisingInterface().policy(&error);

	EXPECT_EQ(error, Firebolt::Error::None);

	if(adPolicy.limitAdTracking.has_value())
		EXPECT_EQ(adPolicy.limitAdTracking, expectedValues["limitAdTracking"]);
	
	if(adPolicy.skipRestriction.has_value())
		EXPECT_EQ(skipRestrictionToString(adPolicy.skipRestriction.value()), expectedValues["skipRestriction"]);
}


// TEST_F(AdvertisingTest, AdvertisingId)
// {
// 	nlohmann::json_abi_v3_11_3::json expectedValues = nlohmann::json::parse(jsonEngine->get_value("Advertising.advertisingId"));

// 	Firebolt::Advertising::AdvertisingIdOptions options;
// 	options.scope.value().type = Firebolt::Advertising::AdvertisingIdOptionsScopeType::CONTENT;
// 	options.scope.value().id = "example";
// 	Firebolt::Advertising::AdvertisingId advertisingId = Firebolt::IFireboltAccessor::Instance().AdvertisingInterface().advertisingId(options, &error);

// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	// EXPECT_EQ(advertisingId.ifa_type, expectedValues["ifa"]);
// }


TEST_F(AdvertisingTest, DeviceAttributes)
{
	std::string expectedValues = jsonEngine->get_value("Advertising.deviceAttributes");

	std::string deviceAttributes = Firebolt::IFireboltAccessor::Instance().AdvertisingInterface().deviceAttributes(&error);
	
	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(deviceAttributes, expectedValues);
}


TEST_F(AdvertisingTest, TestAdvertisingAppBundleId)
{
	
	auto actual_value = jsonEngine->get_value("Advertising.appBundleId");

	auto value = Firebolt::IFireboltAccessor::Instance().AdvertisingInterface().appBundleId(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


// TEST_F(AdvertisingTest, TestAdvertisingonPolicyChanged)
// {
// 	auto expectedValues = jsonEngine->get_value("Advertising.onPolicyChanged");

// 	auto value = Firebolt::IFireboltAccessor::Instance().AdvertisingInterface().onPolicyChanged(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, expectedValues);
// }