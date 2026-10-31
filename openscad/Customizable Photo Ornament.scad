/* Christmas photo ornament. Millimetres. Front prints flat at Z=0.
   Open Customizer, choose a photo format, enter a name, then render (F6).
   Export Frame and Back separately. See README.md for assembly. */

/* [Personalization] */
name_tag = "Christmas 2026";
font_name = "Liberation Sans:style=Bold";
text_size = 7; // [3:0.5:14]
engraving_depth = 0.6; // [0.2:0.1:1]

/* [Photo size] */
photo_format = "Instax Mini"; // [Instax Mini,Instax Square,Instax Wide,3R,4R,Custom]
landscape = false;
custom_width = 60; // [20:0.5:200]
custom_height = 80; // [20:0.5:250]
photo_clearance = 0.5; // [0.2:0.1:1.5]
edge_overlap = 2; // [1:0.5:4]
photo_thickness = 0.8; // [0.2:0.1:1.5]

/* [Frame] */
border = 7; // [5:0.5:15]
tag_height = 18; // [14:1:35]
corner_radius = 4; // [1:0.5:7]
front_thickness = 2; // [1.6:0.2:3]
back_thickness = 1.2; // [0.8:0.2:2]
back_clearance = 0.3; // [0.2:0.05:0.6]
hanger_hole = 4; // [3:0.5:8]
festive_stars = true;

/* [Output] */
part = "Layout"; // [Layout,Frame,Back,Assembly]

/* [Hidden] */
$fn=64;
eps=0.02;
sizes = photo_format=="3R" ? [88.9,127] : photo_format=="4R" ? [101.6,152.4] : photo_format=="Instax Square" ? [72,86] : photo_format=="Instax Wide" ? [108,86] : photo_format=="Custom" ? [custom_width,custom_height] : [54,86];
pw=landscape ? max(sizes) : sizes[0];
ph=landscape ? min(sizes) : sizes[1];
cw=pw+photo_clearance;
ch=ph+photo_clearance;
fw=cw+2*border;
fh=ch+2*border+tag_height;
cy=-tag_height/2;
top=ch/2+border;
bottom=-ch/2-border-tag_height;
rail=border-edge_overlap;
back_z=front_thickness+photo_thickness+0.2;
ledge_z=back_z+back_thickness+back_clearance;
total_z=ledge_z+1.2;
bw=cw-2*back_clearance;
bh=ch-back_clearance;
assert(border>=edge_overlap+3,"Increase border or reduce edge overlap.");
assert(engraving_depth<front_thickness,"Engraving must not cut through front.");
assert(cw>2*edge_overlap+12 && ch>2*edge_overlap+12,"Photo opening is too small.");

module rounded(w,h,r) {
    rr=min(r,min(w,h)/2-0.01);
    offset(r=rr) square([w-2*rr,h-2*rr],center=true);
}
module star(r=2) {
    polygon([for(i=[0:9]) let(a=90+i*36,s=i%2==0?r:r*0.43) [cos(a)*s,sin(a)*s]]);
}
module face_outline() {
    union() {
        translate([0,cy]) rounded(fw,fh,corner_radius);
        // Loop overlaps top border by 3 mm for a continuous connection.
        translate([0,top+3]) circle(d=hanger_hole+7);
    }
}
module frame() {
    difference() {
        union() {
            linear_extrude(front_thickness) difference() {
                face_outline();
                square([pw-2*edge_overlap,ph-2*edge_overlap],center=true);
                translate([0,top+3]) circle(d=hanger_hole);
            }
            // Rear rails stop at the top, allowing back and photo to slide out.
            for(s=[-1,1]) translate([s*(cw/2+border/2),(-ch/2+top)/2,front_thickness-eps])
                linear_extrude(total_z-front_thickness+eps)
                    square([border,top+ch/2],center=true);
            translate([-fw/2,bottom,front_thickness-eps])
                cube([fw,border+tag_height,total_z-front_thickness+eps]);
            // Retaining lips overlap the backer by 1.2 mm at default clearance.
            for(s=[-1,1]) translate([s*(cw/2-1.5),-ch/2,ledge_z])
                translate([s==1?0:-border-1.5,0,0]) cube([border+1.5,ch+border,1.2]);
        }
        // Mirrored on the build plate; reads correctly from the finished front.
        if(len(name_tag)>0) translate([0,-ch/2-border-tag_height/2,-eps]) linear_extrude(engraving_depth+eps)
            mirror([1,0,0]) resize([min(fw-16,max(1,len(name_tag))*text_size*0.63),text_size],auto=false)
                text(name_tag==""?" ":name_tag,size=text_size,font=font_name,halign="center",valign="center");
        if(festive_stars) for(s=[-1,1]) translate([s*(fw/2-border/2),0,-eps])
            linear_extrude(engraving_depth+eps) star(min(2,border/3));
    }
}
module back() {
    // A flat sliding back with a pull tab. Tab remains above the rail entrance.
    linear_extrude(back_thickness) union() {
        translate([0,back_clearance/2]) square([bw,bh],center=true);
        translate([0,ch/2+2]) rounded(min(20,bw-4),8,2);
    }
}
echo(photo_mm=[pw,ph], frame_body_mm=[fw,fh], depth_mm=total_z);
if(part=="Frame") frame();
else if(part=="Back") back();
else if(part=="Assembly") {
    color("FireBrick") frame();
    color("Ivory") translate([0,0,back_z]) back();
} else {
    color("FireBrick") frame();
    color("Ivory") translate([fw/2+bw/2+12,0,0]) back();
}
