-- Production-ready crowdfunding platform database schema
-- Designed to handle thousands of users and campaigns

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table with comprehensive profile data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'
);

-- Campaigns table with full crowdfunding features
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    funding_goal DECIMAL(15,2) NOT NULL CHECK (funding_goal > 0),
    current_funding DECIMAL(15,2) DEFAULT 0 CHECK (current_funding >= 0),
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    cover_image TEXT,
    owner_avatar TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    backers_count INTEGER DEFAULT 0 CHECK (backers_count >= 0),
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0),
    featured BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_funding CHECK (current_funding <= funding_goal * 1.5) -- Allow 150% overfunding
);

-- Reward tiers for campaigns
CREATE TABLE reward_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    claimed_count INTEGER DEFAULT 0 CHECK (claimed_count >= 0),
    max_claims INTEGER,
    estimated_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_claims CHECK (max_claims IS NULL OR claimed_count <= max_claims)
);

-- Payments table for tracking all transactions
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'cancelled')),
    donor_name VARCHAR(255) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    reward_tier_id UUID REFERENCES reward_tiers(id) ON DELETE SET NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Campaign media for images and videos
CREATE TABLE campaign_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign milestones for progress tracking
CREATE TABLE campaign_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    is_reached BOOLEAN DEFAULT FALSE,
    reached_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments and updates on campaigns
CREATE TABLE campaign_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User follows and bookmarks
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, followed_id)
);

CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, campaign_id)
);

-- Notifications system
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and tracking
CREATE TABLE campaign_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE campaign_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table for comprehensive tracking
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes for production scale
CREATE INDEX idx_campaigns_owner_id ON campaigns(owner_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_campaigns_location ON campaigns USING gin(to_tsvector('english', location));
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX idx_campaigns_featured ON campaigns(featured) WHERE featured = TRUE;
CREATE INDEX idx_campaigns_verified ON campaigns(verified) WHERE verified = TRUE;
CREATE INDEX idx_campaigns_search ON campaigns USING gin(to_tsvector('english', title || ' ' || description || ' ' || business_name));

CREATE INDEX idx_payments_campaign_id ON payments(campaign_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX idx_reward_tiers_campaign_id ON reward_tiers(campaign_id);
CREATE INDEX idx_reward_tiers_display_order ON reward_tiers(campaign_id, display_order);

CREATE INDEX idx_campaign_media_campaign_id ON campaign_media(campaign_id);
CREATE INDEX idx_campaign_media_display_order ON campaign_media(campaign_id, display_order);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_campaign_views_campaign_id ON campaign_views(campaign_id);
CREATE INDEX idx_campaign_views_viewed_at ON campaign_views(viewed_at DESC);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_data ON analytics_events USING gin(data);

-- Full-text search indexes
CREATE INDEX idx_campaigns_fts ON campaigns USING gin(to_tsvector('english', title || ' ' || description || ' ' || business_name));
CREATE INDEX idx_users_fts ON users USING gin(to_tsvector('english', full_name || ' ' || COALESCE(bio, '')));

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for common operations
CREATE OR REPLACE FUNCTION increment_campaign_views(campaign_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE campaigns 
    SET views_count = views_count + 1 
    WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_campaign_funding(campaign_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE campaigns 
    SET 
        current_funding = current_funding + amount,
        backers_count = (
            SELECT COUNT(DISTINCT user_id) 
            FROM payments 
            WHERE campaign_id = update_campaign_funding.campaign_id 
            AND status = 'succeeded'
        )
    WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_campaign_milestones(campaign_id UUID)
RETURNS VOID AS $$
DECLARE
    milestone_record RECORD;
    current_funding DECIMAL;
BEGIN
    SELECT current_funding INTO current_funding FROM campaigns WHERE id = campaign_id;
    
    FOR milestone_record IN 
        SELECT * FROM campaign_milestones 
        WHERE campaign_id = check_campaign_milestones.campaign_id 
        AND is_reached = FALSE
        AND target_amount <= current_funding
    LOOP
        UPDATE campaign_milestones 
        SET is_reached = TRUE, reached_at = NOW()
        WHERE id = milestone_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) for data protection
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Campaigns are publicly viewable" ON campaigns
    FOR SELECT USING (status = 'active' OR status = 'completed');

CREATE POLICY "Users can view their own campaigns" ON campaigns
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Payments are viewable by campaign owner and donor" ON payments
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT owner_id FROM campaigns WHERE id = campaign_id)
    );

CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Support tickets are insertable by anyone" ON support_tickets
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own support tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support tickets" ON support_tickets
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE verified = TRUE AND email LIKE '%@thebloomfund.com')
    );

CREATE POLICY "Analytics events are insertable by authenticated users" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Analytics events are viewable by admins and own user" ON analytics_events
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT id FROM users WHERE verified = TRUE AND email LIKE '%@thebloomfund.com')
    );

-- Insert sample data for testing
INSERT INTO users (id, email, full_name, verified) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@thebloomfund.com', 'Admin User', true),
    ('22222222-2222-2222-2222-222222222222', 'sarah@example.com', 'Sarah Johnson', true),
    ('33333333-3333-3333-3333-333333333333', 'alex@example.com', 'Alex Rodriguez', true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;