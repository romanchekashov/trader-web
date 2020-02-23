export const CREATE_COURSE = "CREATE_COURSE";

export function createCourse(course: any) {
    return { type: CREATE_COURSE, course };
}
